const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    homeController.home);

    return routes;
}