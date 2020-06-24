const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");
const signUpController = require("../controllers/signUpController");

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    homeController.home);

    // Rutas para registrarse
    routes.get("/registrate",
    signUpController.signUp);

    routes.post("/registrar",
    signUpController.signUpVerify);

    return routes;
};