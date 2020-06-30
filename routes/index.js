const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    authController.userVerifyAuth,
    homeController.home);

    // Rutas para registrarse
    routes.get("/registrate",
    usersController.signUpCharge);

    routes.post("/registrate",
    usersController.signUpVerify);

    // Para iniciar sesion
    routes.get("/iniciar_sesion",
    usersController.loginCharge);

    routes.post("/iniciar_sesion",
    authController.autenticarUsuario);

    // Cerrar sesion
    routes.get("/cerrar_sesion", authController.logout);

    return routes;
};