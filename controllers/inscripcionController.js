// Importar modelo de inscripciones
const Inscripcion = require("../models/Inscripcion");

// Importar modelo de cursos
const Curso = require("../models/Curso");

// Importar el modelo de lecciones
const Leccion = require("../models/Leccion");

// Importar el modelo de usuarioas
const Usuario = require("../models/Usuario");

const Comentario = require("../models/Comentario");

// Importar moment para obtener las fechas
const moment = require("moment");
moment.locale("es");

// Inscribirse a un determinado curso
// Esta insercion apunta a la tabla de inscripciones
exports.inscripcionCurso = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url: req.params.url } });
    await Inscripcion.create({ usuarioId: usuario.id, cursoId: curso.id });
    res.redirect("/lista_curso_inscrito");
  } catch {
    mensajes.push({ mensaje: "Ha ocurrido un error", type: "alert-danger" });
    res.render("info_curso", { mensajes });
  }
};

// Mostrar la lista de los cursos inscritos
exports.listaInscrito = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const usuarioInscripcion = [];
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
          where: { id: usuarioInscripcion },
          include: {
            model: Usuario,
            required: "true",
          },
        });
        console.log(cursos);
        res.render("lista_curso_inscrito", { cursos });
      })
      .catch();
  } catch (error) {
    console.log(error);
  }
};

// Mostrar la informacion del curso inscrito
exports.infoCursoInscrito = async (req, res, next) => {
  const mensajes = [];
  try {
    // Obtener la informacion del curso inscrito
    const curso = await Curso.findOne({ where: { url: req.params.url } });

    // Buscar el usuario que imparte el curso
    const usuarioCreado = await Usuario.findOne({
      where: { id: curso.usuarioId },
    });

    // Obtener las lecciones
    const lecciones = await Leccion.findAll({
      where: { cursoId: curso.id },
    });

    //
    const comentarios = await Comentario.findAll({
      where: {
        cursoId: curso.id,
      },
      include: {
        model: Usuario,
        required: true,
      },
    });
    // Obtener la cantidad de personas inscritas
    const cantidadInscritos = await Inscripcion.findAndCountAll({
      where: {
        cursoId: curso.id,
      },
    });

    // Obtener la fecha de publicacion del cuerso
    const hace = moment(curso.dataValues.fecha).fromNow();
    res.render("info_curso_ins", {
      curso: curso.dataValues,
      usuarioCreado: usuarioCreado.dataValues,
      cantidadInscritos,
      lecciones,
      comentarios,
      hace,
    });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error, el curso no se encuentra disponible",
      type: "alert-danger",
    });
    res.render("lista_curso_inscrito", { mensajes });
  }
};
