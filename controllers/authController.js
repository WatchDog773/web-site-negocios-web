const passport = require("passport");

const Usuario = require("../models/Usuario");

const Sequelize = require("sequelize");

// Importar crypto
const crypto = require("crypto");

// Importar la configuracion de envio de correo electronico
const enviarCorreo = require("../helpers/email");

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
    usuario.token = crypto.randomBytes(20).toString("hex");
    usuario.expiration = Date.now() + 300000;

    // Guardar el token y la fecha de expiración del token
    await usuario.save();

    // Crear una url de restablecer contraseña
    const resetUrl = `http://${req.headers.host}/restablecerPassword/${usuario.token}`;

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