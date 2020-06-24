const express = require("express");
const routes = express.Router();

const userController = require("../controllers/userController");

// Rutas disponibles
module.exports = function() {
    routes.get("/",
    userController.user);

    routes.post("/home",
    userController.respuesta);

    return routes;
}