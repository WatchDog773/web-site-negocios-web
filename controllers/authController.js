const passport = require("passport");

const Usuario = require("../models/Usuario");

const Sequelize = require("sequelize");

// Importar crypto
const crypto = require("crypto");

// Importar la configuracion de envio de correo electronico
const enviarCorreo = require("../helpers/email");
const { inicio } = require("./homeController");

// Verificar si el usuario se puede autenticar
exports.autenticarUsuario = passport.authenticate("local", {
    successRedirect: "/inicio",
    failureRedirect: "/iniciar_sesion",
    badRequestMessage: "Debes ingresar tu correo electrónico y tu contraseña",
    failureFlash: true,
});

// Cerrar la sesion del usuario actual
exports.logout = (req, res, next) => {
    // Al cerrar sesion redirigir el usuario al login
    req.session.destroy(() => {
        res.redirect("/iniciar_sesion");
    });
};

// Verifica si el usuario esta autenticado o no
exports.userVerifyAuth = (req, res, next) => {
    // Si el usuario se autentico que continue la peticion
    if (req.isAuthenticated()) {
        return next();
    }

    // Si el usuario no esta autenticado
    return res.redirect("/");
};

// Ruta que genera un token que le permite al usuario restablecer la contraseña mediante un enlace
exports.enviarToken = async (req, res, next) => {
    // Verificar si existe el usuario
    const { email } = req.body;
    const usuario = await Usuario.findOne(
        {
            where: { email }
        }
    );

    // Si el usuario no existe
    if (!usuario) {
        req.flash("error", "¡Este usuario no esta registrado en Dev - Acad!");
        res.redirect("/restablecer_password");
    }

    // Si el usuario existe, generar un token único con una fecha de expiración
    usuario.token = crypto.randomBytes(20).toString("hex") + Date.now() + Math.round(Math.random() * 1E9); // Generando un token aun mas aleatorio
    usuario.expiration = Date.now() + 300000;

    // Guardar el token y la fecha de expiración del token
    await usuario.save();

    // Crear una url de restablecer contraseña
    const resetUrl = `http://${req.headers.host}/resetear_password/${usuario.token}`;

    // Enviar el correo electronico al usuario con el link que contiene el token generado
    await enviarCorreo.enviarCorreo(
        {
            usuario,
            subject: "Restablece tu contraseña de Dev - Acad",
            resetUrl,
            vista: "restablecer_correo_electrónico",
            text: "¡Has solicitado restablecer tu contraseña de Dev - Acada! Autoriza el contenido HTML."
        }
    );

    // Redireccionar al usuario al inicio de sesion
    req.flash("succes", "Se envió un enlace para restablecer tu contraseña a tu correo electrónico");
    res.redirect("/iniciar_sesion");
};

// Muestra el formulario de cambiar contraseña si existe un token valido
exports.validarToken = async (req, res, next) => {
    try {
        // Buscar  si el token enviado existe
        const { token } = req.params;

        const usuario = await Usuario.findOne(
            {
                where: { token }
            }
        );

        // Si el usuario no encuentra el usuario
        if (!usuario) {
            req.flash("error", "¡El enlace que seguiste no es valido!");
            res.redirect("/restablecer_password");
        }

        // TODO: Si el usuario existe, mostrar el formulario de generar nueva contraseña
        res.render("resetear_password", { layout: "layout_inicio" });
    } catch (error) {
        res.redirect("/restablecer_password");
    }
};

// Permite cambiar la contraseña de un token valido
