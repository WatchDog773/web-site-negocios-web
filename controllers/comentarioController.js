// Importar el modelo de comentarios
const Comentario = require("../models/Comentario");
const Curso = require("../models/Curso");
exports.publicarComentario = async (req, res, next) => {
  // Capturamos el comentario por destructuring
  const usuario = res.locals.usuario;
  const url = req.params.url;
  console.log(url);
  const { comentario } = req.body;
  console.log(req.body);
  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url } });
    if (!comentario) {
      mensajes.push({
        mensaje: "La reseña no puede ir vacia",
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
