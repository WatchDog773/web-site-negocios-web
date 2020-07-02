// Importar modelo de inscripciones
const Inscripcion = require("../models/Inscripcion");
// Importar modelo de cursos
const Curso = require("../models/Curso");

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
        });
        console.log(cursos);
        res.render("lista_curso_inscrito", { cursos });
      })
      .catch();
  } catch (error) {
    console.log(error);
  }
};
