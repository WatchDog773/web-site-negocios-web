const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");
const usersController = require("../controllers/usersController");
const cursoController = require("../controllers/cursosController");
const authController = require("../controllers/authController");

// Rutas disponibles
module.exports = function () {
  routes.get("/", authController.userVerifyAuth, homeController.home);

  // Rutas para registrarse
  routes.get("/registrate", usersController.signUpCharge);

  routes.post("/registrate", usersController.signUpVerify);

  // Para iniciar sesion
  routes.get("/iniciar_sesion", usersController.loginCharge);

  routes.post("/iniciar_sesion", authController.autenticarUsuario);

  // Rutas para los cursos
  routes.get(
    "/agregar_curso",
    authController.userVerifyAuth,
    cursoController.crearCurso
  );

  // Cerrar sesion
  routes.get("/cerrar_sesion", authController.logout);

  return routes;
};
