// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

// Importar el modelo de curso
const Curso = require("../models/Curso");

// Importar sequelize
const Sequelice = require("sequelize");

exports.cargarFormularioInsertarLeccion = async (req, res, next) => {
  /* res.send(req.params.id); */
  try {
    const curso = await Curso.findOne({
      where: { id: req.params.id },
    });

    res.render("agregar_leccion", { curso: curso.dataValues });
  } catch (error) {
    res.send("Ocurrio un error, contacta con el administrador (consola)");
    console.log(error);
  }
};

exports.insertarLeccion = async (req, res, next) => {
  const mensajes = [];
  const cursoId = req.params.id;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    mensajes.push({
      error: "La leccion debe tener un nombre",
      type: "alert-danger",
    });
  }
  if (!descripcion) {
    mensajes.push({
      error: "La leccion debe tener una descripcion",
      type: "alert-danger",
    });
  }

  // Si hay mensajes
  if (mensajes.length) {
    res.render("agregar_leccion", { mensajes });
  } else {
    try {
      await Leccion.create({
        nombre,
        descripcion,
        cursoId: cursoId,
      });
      mensajes.push({
        error: "Leccion Guardada",
        type: "alert-success",
      });

      res.redirect("/lista_curso_doc");
    } catch (error) {
      mensajes.push({
        error: "Ha ocurrido un error con la base de datos",
        type: "alert-danger",
      });

      res.render("agregar_leccion", { mensajes });
    }
  }
};

// Eliminar leccion del curso
exports.eliminarLeccion = async (req, res, next) => {
  const { id } = req.query;

  try {
    const resultado = await Leccion.destroy({
      where: {
        id,
      },
    });
    res.status(200).send("Leccion eliminada correctamente");
  } catch (error) {
    return next();
  }
};
