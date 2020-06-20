const express = require("express");
const routes = express.Router();

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    homeController.home);

    return routes;
}