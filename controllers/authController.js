const passport = require("passport");

const Usuario = require("../models/Usuario");

// Traer Sequelize
const Sequelize = require("sequelize");

// Utilizar los operados de sequelize
const Op = Sequelize.Op;

// Importar crypto
const crypto = require("crypto");

// Importar bcrypt
const bcrypt = require("bcrypt-nodejs");

// Importar la configuracion de envio de correo electronico
const enviarCorreo = require("../helpers/email");
const { inicio } = require("./homeController");
const { pass } = require("../config/email");

// Verificar si el usuario se puede autenticar
exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar_sesion",
  badRequestMessage: "Debes ingresar tu correo electrónico y tu contraseña",
  failureFlash: true,
});

// Cerrar la sesion del usuario actual
exports.logout = (req, res, next) => {
  // Al cerrar sesion redirigir el usuario al login
  req.session.destroy(() => {
    res.redirect("/");
  });
};

// Verifica si el usuario esta autenticado o no
exports.userVerifyAuth = (req, res, next) => {
  // Si el usuario se autentico que continue la petición
  if (req.isAuthenticated()) {
    return next();
  }

  // Si el usuario no esta autenticado
  return res.redirect("/iniciar_sesion");
};

// Ruta que genera un token que le permite al usuario restablecer la contraseña mediante un enlace
exports.enviarToken = async (req, res, next) => {
  // Verificar si existe el usuario
  const { email } = req.body;
  const usuario = await Usuario.findOne({
    where: { email },
  });

  // Si el usuario no existe
  if (!usuario) {
    req.flash("error", "¡Este usuario no esta registrado en Dev - Acad!");
    res.redirect("/restablecer_password");
  }

  // Si el usuario existe, generar un token único con una fecha de expiración
  usuario.token =
    crypto.randomBytes(20).toString("hex") +
    Date.now() +
    Math.round(Math.random() * 1e9); // Generando un token aun mas aleatorio
  usuario.expiration = Date.now() + 300000;

  // Guardar el token y la fecha de expiración del token
  await usuario.save();

  // Crear una url de restablecer contraseña
  const resetUrl = `http://${req.headers.host}/resetear_password/${usuario.token}`;

  // Enviar el correo electronico al usuario con el link que contiene el token generado
  await enviarCorreo.enviarCorreo({
    usuario,
    subject: "Restablece tu contraseña de Dev - Acad",
    resetUrl,
    vista: "restablecer_correo_electrónico",
    text:
      "¡Has solicitado restablecer tu contraseña de Dev - Acada! Autoriza el contenido HTML.",
  });

  // Redireccionar al usuario al inicio de sesion
  req.flash(
    "succes",
    "Se envió un enlace para restablecer tu contraseña a tu correo electrónico"
  );
  res.redirect("/iniciar_sesion");
};

// Muestra el formulario de cambiar contraseña si existe un token valido
exports.validarToken = async (req, res, next) => {
  const verifyAuth = false;
  try {
    // Buscar  si el token enviado existe
    const { token } = req.params;
    const mensajes = [];

    const usuario = await Usuario.findOne({
      where: {
        token,
        expiration: {
          [Op.gte]: Date.now(),
        },
      },
    });

    // Si el usuario no encuentra el usuario
    if (!usuario) {
      req.flash(
        "error",
        "¡El enlace que seguiste no es valido o el token ha expirado!"
      );
      mensajes.push({
        mensaje: "¡El enlace que seguiste no es valido o el token ha expirado!",
        type: "alert-danger",
      });

      res.render("restablecer_password", { verifyAuth, mensajes });
      /* res.redirect("/restablecer_password"); */
    } else {
      // Si el usuario existe y su token no ha expirado, mostrar el formulario de generar nueva contraseña
      res.render("resetear_password", { verifyAuth, token });
    }
  } catch (error) {
    res.redirect("/iniciar_sesion");
  }
};

// Permite cambiar la contraseña de un token valido
exports.actualizarContraseña = async (req, res, next) => {
  const verifyAuth = false;
  // Obtener al usuario mediante el token y verificar que el token no ha expirado, solo tiene 5 mins
  const usuario = await Usuario.findOne({
    where: {
      token: req.params.token,
      expiration: { [Op.gte]: Date.now() },
    },
  });

  // Verificar que obteiene un usuario
  if (!usuario) {
    req.flash(
      "error",
      "Token no valido o vencido. El token tiene 5 minutos de valides"
    );
    res.redirect("/restablecer_password");
  }

  // Si el token es correcto y aun no vence
  const { password, passwordVerify } = req.body;
  const mensajes = [];
  /* usuario.passport = bcrypt.hashSync() */

  if (password != passwordVerify) {
    mensajes.push({
      mensaje: "Las contraseñas no coinciden",
      type: "alert-warning",
    });
  }
  if (!password) {
    mensajes.push({
      mensaje: "Tienes que escribir una contraseña",
      type: "alert-danger",
    });
  }
  if (!passwordVerify) {
    mensajes.push({
      mensaje: "Tienes que volver a escribir la contraseña",
      type: "alert-danger",
    });
  }

  // Asignar al token para reenviarlo al formulario por si hay errores
  const token = usuario.token;

  // Si hay errores
  if (mensajes.length) {
    res.render("resetear_password", {
      verifyAuth,
      mensajes,
      token,
    });
    console.log(mensajes);
  } else {
    try {
      usuario.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      // Limpiar los valores del token y de la expiracion
      usuario.token = null;
      usuario.expiration = null;

      // Guardar los cambios
      await usuario.save();

      // Redireccionar al inicio de sesion
      req.flash("success", "Tu contraseña ha sido actualizada correctamente");
      res.redirect("/iniciar_sesion");
    } catch (error) {
      console.log(
        "**********************************************************************"
      );
      console.log(error);
    }
  }
};
