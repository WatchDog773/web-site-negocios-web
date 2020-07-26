const passport = require("passport");

const Usuario = require("../models/Usuario");

const Sequelize = require("sequelize");

// Verificar si el usuario se puede autenticar
exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/inicio",
  failureRedirect: "/iniciar_sesion",
  badRequestMessage: "Debes ingrear tu correo electronico y tu contraseña",
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
