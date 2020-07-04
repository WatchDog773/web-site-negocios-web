// Importar el modelo de cursos
const Curso = require("../models/Curso");
const Inscripcion = require("../models/Inscripcion");
const { Op } = require("sequelize");

// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

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
      res.redirect("/lista_curso_doc");
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

// Mostrar la informacion para cada curso si somos docentes
exports.infoCursoDoc = async (req, res, next) => {
  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url: req.params.url } });
    const lecciones = await Leccion.findAll({
      where: { cursoId: curso.id }
    });
    res.render("info_curso_doc", { curso: curso.dataValues, lecciones });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error al momento de administrar el curso",
      type: "alert-danger",
    });
    res.render("lista_curso_doc", { mensajes });
  }
};
// Mostrar la vista para editar los campos
exports.cargarActualizarCurso = async (req, res, next) => {
  const mensajes = [];
  try {
    const curso = await Curso.findByPk(req.params.id);
    res.render("actualizar_curso", { curso: curso.dataValues });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error, el curso no puede actualizarse",
      type: "alert-danger",
    });
  }
};
// Ejecutar la actualizacion
exports.actualizarCurso = async (req, res, nex) => {
  const mensajes = [];
  const usuario = res.locals.usuario;
  const { nombre, descripcion, precio, categoria } = req.body;
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
    const curso = Curso.findByPk(req.params.id);
    res.render("actualizar_curso", { mensajes, curso: curso.dataValues });
  } else {
    try {
      await Curso.update(
        {
          nombre,
          descripcion,
          precio,
          categoria,
        },
        { where: { id: req.params.id } }
      );
      mensajes.push({
        mensaje: "Curso actualizado exitosamente",
        type: "alert-success",
      });
      res.render("actualizar_curso", { mensajes });
    } catch {
      mensajes.push({
        mensaje: "Ha ocurrido un error con la base de datos",
        type: "alert-danger",
      });
      res.render("agregar_curso", { mensajes });
    }
  }
};
// Mostrar la lista de los
