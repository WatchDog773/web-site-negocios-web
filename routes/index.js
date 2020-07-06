const express = require("express");
const routes = express.Router();

const homeController = require("../controllers/homeController");
const usersController = require("../controllers/usersController");
const cursoController = require("../controllers/cursosController");
const inscripcionController = require("../controllers/inscripcionController");
const authController = require("../controllers/authController");
const leccionController = require("../controllers/leccionController");

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
  routes.get(
    "/inscripcion_curso/:url",
    authController.userVerifyAuth,
    inscripcionController.inscripcionCurso
  );

  routes.get(
    "/lista_curso_inscrito",
    authController.userVerifyAuth,
    inscripcionController.listaInscrito
  );

  // Cargar la vista para ver la informacion del curso inscrito
  routes.get(
    "/info_curso_inscrito/:url",
    authController.userVerifyAuth,
    inscripcionController.infoCursoInscrito
  );

  // Abrir informacion para la administracion del curso
  routes.get(
    "/admin_curso/:url",
    authController.userVerifyAuth,
    cursoController.infoCursoDoc
  );

  // Cargar la vista para editar los campos del curso
  routes.get(
    "/actualizar_curso/:id",
    authController.userVerifyAuth,
    cursoController.cargarActualizarCurso
  );
  // Ejecutar la actualizacion del curso
  routes.post(
    "/actualizar_curso/:id",
    authController.userVerifyAuth,
    cursoController.actualizarCurso
  );

  // Ver el perfil del usuario
  routes.get(
    "/actualizar_perfil",
    authController.userVerifyAuth,
    usersController.verPerfilUsuario
  );
  routes.post(
    "/actualizar_perfil",
    authController.userVerifyAuth,
    usersController.actualizarPerfil
  );

  // Agregar leccion
  routes.get(
    "/agregar_leccion/:id",
    authController.userVerifyAuth,
    leccionController.cargarFormularioInsertarLeccion
  );
  routes.post(
    "/agregar_leccion/:id",
    authController.userVerifyAuth,
    leccionController.insertarLeccion
  );

  // Actualizar leccion
  routes.get(
    "/actualizar_leccion/:url/:cursoId",
    authController.userVerifyAuth,
    leccionController.cargarFormularioactualizarLeccion
  );
  routes.post(
    "/actualizar_leccion/:id/:cursoUrl",
    authController.userVerifyAuth,
    leccionController.actualizarLeccion
  );

  // eliminar leccion
  routes.delete(
    "/leccion/:id",
    authController.userVerifyAuth,
    leccionController.eliminarLeccion
  );

  // Cerrar sesion
  routes.get("/cerrar_sesion", authController.logout);
  return routes;
};
