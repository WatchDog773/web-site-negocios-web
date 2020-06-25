const passport = require("passport");

const Usuario = require("../models/Usuario");

const Sequelize = require("sequelize");

// Verificar si el usuario se puede autenticar
exports.autenticarUsuario = passport.authenticate('local',
    {
        successRedirect: "/",
        failureRedirect: "/iniciar_sesion",
        badRequestMessage: "Debes ingrear tu correo electronico y tu contraseña",

    }
);