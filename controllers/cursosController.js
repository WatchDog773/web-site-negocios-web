// Importar el modelo de cursos
const Curso = require("../models/Curso");
const Inscripcion = require("../models/Inscripcion");
const { Op } = require("sequelize");
// Renderizar la vista de agregar curso
exports.agregarCurso = (req, res, next) => {
  res.render("agregar_curso");
};

// Insertar el curso a la bd
exports.insertarCurso = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const { nombre, descripcion, precio, categoria } = req.body;
  const mensajes = [];
  if (!nombre) {
    mensajes.push({
      mensaje: "El nombre del curso no puede ir vacio",
      type: "alert-danger",
    });
  }
  if (!descripcion) {
    mensajes.push({
      mensaje: "La descripcion del curso no puede ir vacio",
      type: "alert-danger",
    });
  }
  if (!precio) {
    mensajes.push({
      mensaje: "El precio del curso no puede ir vacio",
      type: "alert-danger",
    });
  }
  if (!categoria) {
    mensajes.push({
      mensaje: "La categoria del curso no puede ir vacio",
      type: "alert-danger",
    });
  }
  if (mensajes.length) {
    res.render("agregar_curso", { mensajes });
  } else {
    try {
      await Curso.create({
        nombre,
        descripcion,
        precio,
        categoria,
        usuarioId: usuario.id,
      });
      mensajes.push({
        mensaje: "Curso guardado exitosamente",
        type: "alert-success",
      });
    } catch {
      mensajes.push({
        mensaje: "Ha ocurrido un error con la base de datos",
        type: "alert-danger",
      });
      res.render("agregar_curso", { mensajes });
    }
  }
};

// Mostrar los cursos del docente
exports.listaCursoDoc = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const mensajes = [];
  try {
    const cursos = await Curso.findAll({ where: { usuarioId: usuario.id } });
    res.render("lista_curso_doc", { cursos });
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("lista_curso_doc", { mensajes });
  }
};

// Mostrar los cursos para inscribirse
exports.listaCursoAlu = async (req, res, next) => {
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
        res.render("lista_curso_alu", { cursos });
      })
      .catch();
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("lita_curso_alu", { mensajes });
  }
};

// Mostrar la informacion para cada curso si somos alumnos
exports.infoCurso = async (req, res, next) => {
  try {
    const curso = await Curso.findOne({ where: { url: req.params.url } });
    res.render("info_curso", { curso });
  } catch {}
};

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

// Mostrar la lista de los
