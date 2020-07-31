// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

// Importar el modelo de curso
const Curso = require("../models/Curso");

// Importar sequelize
const Sequelice = require("sequelize");

exports.leccionInfoInscrito = async (req, res, next) => {
  const urlLeccion = req.params.url;
  const mensajes = [];
  try {
    const leccion = await Leccion.findOne({
      where: {
        url: urlLeccion,
      },
    });
    res.render("leccion_info_ins", {
      leccion: leccion.dataValues,
    });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error.",
      type: "alert-danger",
    });
  }
};

exports.cargarFormularioInsertarLeccion = async (req, res, next) => {
  /* res.send(req.params.id); */
  try {
    usuario = res.locals.usuario;
    const curso = await Curso.findOne({
      where: { id: req.params.id },
    });

    // Solo el usuario propietario del curso puede agregar lecciones
    if (usuario.id == curso.usuarioId) {
      res.render("agregar_leccion", { curso: curso.dataValues });
    } else {
      res.send("Lo sentimos, no se pudo cargar");
    }
  } catch (error) {
    res.send("Ocurrio un error, contacta con el administrador (consola)");
    console.log(error);
  }
};

exports.insertarLeccion = async (req, res, next) => {
  const mensajes = [];
  const cursoId = req.params.id;
  const video = req.files.video[0].filename;
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
        video,
        cursoId: cursoId,
      });
      mensajes.push({
        error: "Leccion Guardada",
        type: "alert-success",
      });

      // Buscar la url del curso mediante el id
      const curso = await Curso.findOne({
        where: { id: cursoId },
      });

      /* res.redirect("/lista_curso_doc"); */
      res.redirect(`/admin_curso/${curso.url}`);
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

// Cargar formulario de Actualizar leccion
exports.cargarFormularioactualizarLeccion = async (req, res, next) => {
  /* res.send(req.params.cursoId); */
  try {
    const usuario = res.locals.usuario;
    const leccion = await Leccion.findOne({
      where: { url: req.params.url },
    });

    const curso = await Curso.findOne({
      where: { id: req.params.cursoId },
    });

    // Solo el usuario propietario del curso puede editar las lecciones
    if (usuario.id == curso.usuarioId) {
      res.render("actualizar_leccion", {
        leccion: leccion.dataValues,
        curso: curso.dataValues,
      });
    } else {
      res.send("Lo sentimos, no se pudo cargar");
    }
  } catch (error) {
    res.send("Ocurrio un error, contacta con el administrador (consola)");
    console.log(error);
  }
};

exports.actualizarLeccion = async (req, res, next) => {
  /* res.send(req.params.cursoUrl); */
  const { nombre, descripcion } = req.body;
  const mensajes = [];

  // Mandar a llamar los datos de la leccion a actualizar
  try {
    const leccion = await Leccion.findOne({
      where: {
        id: req.params.id,
      },
    });

    let video = "";
    if (Object.keys(req.files).length == 0) {
      video = leccion.video;
    } else {
      video = req.files.video[0].filename;
    }

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
      res.render("actualiza_leccion", { mensajes });
    } else {
      await Leccion.update(
        {
          nombre,
          descripcion,
          video,
        },
        {
          where: { id: req.params.id },
        }
      );

      mensajes.push({
        error: "Leccion Actualizado correctamente",
        type: "alert-success",
      });

      /* res.redirect("/lista_curso_doc"); */
      res.redirect(`/admin_curso/${req.params.cursoUrl}`);
    }
  } catch (error) {
    res.send("Ocurrio un error, contacta con el administrador (consola)");
    console.log(error);
  }

  // Verificar si el usuario subio un video
};
