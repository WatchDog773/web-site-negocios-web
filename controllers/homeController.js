// Importar controlador de cursos
const Curso = require("../models/Curso");
const Inscripcion = require("../models/Inscripcion");
const Usuario = require("../models/Usuario");
const { Op } = require("sequelize");

const routes = require("../routes");

exports.home = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const usuarioInscripcion = [];
  const mensajes = [];
  try {
    Inscripcion.findAll({
      where: {
        usuarioId: usuario.id,
      },
    })
      .then(async function (inscripciones) {
        inscripciones = inscripciones.map(function (inscripcion) {
          usuarioInscripcion.push(inscripcion.dataValues.cursoId);
          return inscripcion;
        });
        console.log(usuarioInscripcion);
        const cursos = await Curso.findAll({
          where: {
            usuarioId: {
              [Op.not]: usuario.id,
            },
            id: {
              [Op.notIn]: usuarioInscripcion,
            },
          },
        });
        res.render("home", { cursos });
      })
      .catch();
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("home", { mensajes });
  }
};

exports.inicio = async (req, res, next) => {
  const usuario_locals = res.locals.usuario;
  try {
    const usuario = await Usuario.findByPk(usuario_locals.id);
    res.render("inicio", { usuario });
  } catch (error) {
    console.log(error);
  }
};
