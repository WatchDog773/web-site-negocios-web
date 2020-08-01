// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

// Importar el modelo de curso
const Curso = require("../models/Curso");

// Importar sequelize
const Sequelice = require("sequelize");

exports.leccionInfoInscrito = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;

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
      usuario,
      verifyAuth,
    });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error.",
      type: "alert-danger",
    });
    res.render("leccion_info_ins", { mensajes, usuario, verifyAuth });
  }
};

exports.cargarFormularioInsertarLeccion = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  /* res.send(req.params.id); */
  try {
    const curso = await Curso.findOne({
      where: { id: req.params.id },
    });

    // Solo el usuario propietario del curso puede agregar lecciones
    if (usuario.id == curso.usuarioId) {
      res.render("agregar_leccion", {
        curso: curso.dataValues,
        usuario,
        verifyAuth,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.render("agregar_leccion", { mensajes, usuario, verifyAuth });
  }
};

exports.insertarLeccion = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  const cursoId = req.params.id;
  const video = req.files.video[0].filename;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    mensajes.push({
      mensaje: "La leccion debe tener un nombre",
      type: "alert-danger",
    });
  }
  if (!descripcion) {
    mensajes.push({
      mensaje: "La leccion debe tener una descripcion",
      type: "alert-danger",
    });
  }

  // Si hay mensajes
  if (mensajes.length) {
    res.render("agregar_leccion", { mensajes, usuario, verifyAuth });
  } else {
    try {
      await Leccion.create({
        nombre,
        descripcion,
        video,
        cursoId: cursoId,
      });
      mensajes.push({
        mensaje: "Leccion Guardada",
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
        mensaje: "Ha ocurrido un error con la base de datos",
        type: "alert-danger",
      });

      res.render("agregar_leccion", {
        mensajes,
        usuario,
        verifyAuth,
      });
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
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  /* res.send(req.params.cursoId); */
  try {
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
        usuario,
        verifyAuth,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error con la base de datos",
      type: "alert-danger",
    });

    res.render("actualizar_leccion", {
      mensajes,
      usuario,
      verifyAuth,
    });
  }
};

exports.actualizarLeccion = async (req, res, next) => {
  /* res.send(req.params.cursoUrl); */
  const usuario = res.locals.usuario;
  const verifyAuth = true;
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
        mensaje: "La leccion debe tener un nombre",
        type: "alert-danger",
      });
    }
    if (!descripcion) {
      mensajes.push({
        mensaje: "La leccion debe tener una descripcion",
        type: "alert-danger",
      });
    }
    // Si hay mensajes
    if (mensajes.length) {
      res.render("actualizar_leccion", { mensajes, usuario, verifyAuth });
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
        mensaje: "Leccion Actualizado correctamente",
        type: "alert-success",
      });

      /* res.redirect("/lista_curso_doc"); */
      res.redirect(`/admin_curso/${req.params.cursoUrl}`);
    }
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error con la base de datos",
      type: "alert-danger",
    });
    res.render("actualizar_leccion", { mensajes, usuario, verifyAuth });
  }

  // Verificar si el usuario subio un video
};
