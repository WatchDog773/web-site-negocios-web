const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");
const usersController = require("../controllers/usersController");

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    homeController.home);

    // Rutas para registrarse
    routes.get("/registrate",
    usersController.signUpCharge);

    routes.post("/registrar",
    usersController.signUpVerify);

    return routes;
};