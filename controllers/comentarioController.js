// Importar el modelo de comentarios
const Comentario = require("../models/Comentario");

// Importar el modelo de cursos
const Curso = require("../models/Curso");

exports.publicarComentario = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const url = req.params.url;
  console.log(url);
  // Capturamos el comentario y el puntaje de la reseña por destructuring
  const { comentario, puntaje } = req.body;
  console.log(req.body);

  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url } });
    if (!comentario) {
      mensajes.push({
        mensaje: "El comentario de la reseña no puede ir vacio",
        type: "alert-danger",
      });
    }

    if (mensajes.length) {
      res.render("info_curso_ins", {
        curso,
        mensajes,
      });
    } else {
      await Comentario.create({
        comentario,
        puntaje,
        cursoId: curso.id,
        usuarioId: usuario.id,
      });
      res.redirect(`/info_curso_inscrito/${url}`);
    }
  } catch (error) {
    console.log(error);
    mensajes.push({
      mensaje: "Hubo un error al cargar los datos",
      type: "alert-danger",
    });
    res.render("info_curso_ins", { mensajes });
  }
};
