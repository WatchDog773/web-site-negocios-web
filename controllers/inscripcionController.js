// Importar modelo de inscripciones
const Inscripcion = require("../models/Inscripcion");
const Curso = require("../models/Curso");

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
