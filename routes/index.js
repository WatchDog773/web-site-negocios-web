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
  //Cargar la vista para agregar los cursos
  routes.get(
    "/agregar_curso",
    authController.userVerifyAuth,
    cursoController.agregarCurso
  );
  // Metodo POST para insertar los cursos
  routes.post(
    "/agregar_curso",
    authController.userVerifyAuth,
    cursoController.insertarCurso
  );
  // Cargar la vista para ver la lista de los cursos que se estan impartiendo
  routes.get(
    "/lista_curso_doc",
    authController.userVerifyAuth,
    cursoController.listaCursoDoc
  );

  // Cargar la vista para ver la lista de los cursos que se puede inscribir
  routes.get(
    "/lista_curso_alu",
    authController.userVerifyAuth,
    cursoController.listaCursoAlu
  );

  // Cargar la vista para ver la informacion del curso
  routes.get(
    "/info_curso/:url",
    authController.userVerifyAuth,
    cursoController.infoCurso
  );
  // Cerrar sesion
  routes.get("/cerrar_sesion", authController.logout);

  return routes;
};
