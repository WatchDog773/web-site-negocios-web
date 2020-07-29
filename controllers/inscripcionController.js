// Importar modelo de inscripciones
const Inscripcion = require("../models/Inscripcion");

// Importar modelo de cursos
const Curso = require("../models/Curso");

// Importar el modelo de lecciones
const Leccion = require("../models/Leccion");

// Importar el modelo de usuarioas
const Usuario = require("../models/Usuario");

const Comentario = require("../models/Comentario");

const { Op, json } = require("sequelize");
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

        /**
         * NOTA
         * El Codigo siguiente es utilizado para obtener el puntaje promedio (rating)
         * de cada uno de los cursos. Este puntaje es traido de la tabla de comentarios.
         */
        // Definir un arreglo en donde se guardaran cada uno de los cursos por mostrar.
        const cursosArray = [];
        // Definr un arreglo en donde se guardaran los id's de cada uno de los cursos
        const cursosId = [];
        // Mapear la constante de cursos definida previamente
        cursos.map((curso) => {
          cursosArray.push({
            idCurso: curso.dataValues.id,
            nombreCurso: curso.dataValues.nombre,
            descripcion: curso.dataValues.descripcion,
            precio: curso.dataValues.precio,
            url: curso.dataValues.url,
            nombreUsuario: curso.dataValues.usuario.dataValues.nombre,
            apellidoUsuario: curso.dataValues.usuario.dataValues.apellido,
            imagen: curso.dataValues.imagen,
          });
          // Hacemos un push de los id's en el arreglo de cursosId,
          // Esto funcionara para buscar los comentarios de acuerdo a los id's
          cursosId.push(curso.dataValues.id);
        });
        console.log(cursosId);

        // Buscamos los comentarios de la base de datos de acuerdo a los id's de cursosId
        const comentarios = await Comentario.findAll({
          where: {
            cursoId: {
              [Op.in]: cursosId,
            },
          },
        });

        // Definir un arreglo en donde se guardaran los comentarios
        const comentariosArray = [];
        comentarios.map((comentario) => {
          comentariosArray.push({
            cursoId: comentario.dataValues.cursoId,
            puntaje: comentario.dataValues.puntaje,
          });
        });

        // definir un variable acumuladora y otra para determinar la cantidad
        //de comentarios por curso
        let acumulador = 0;
        let cantidad = 0;
        let promedio = 0;
        // Definir un arreglo para guardar los datos que seran mostrados en la vista
        const cursosArrayView = [];
        for (let x = 0; x < cursosArray.length; x++) {
          const element = cursosArray[x];
          for (let y = x; y < comentariosArray.length; y++) {
            const element2 = comentariosArray[y];
            if (element.idCurso == element2.cursoId) {
              acumulador = acumulador + element2.puntaje;
              cantidad++;
            }
          }
          // Verificar si el curso tiene comentarios, esto para evitar una division entre 0
          if (cantidad == 0) {
            promedio = 0;
          } else {
            promedio = Math.round(acumulador / cantidad);
          }
          // Agregar los datos que seran mostrados a la vista
          cursosArrayView.push({
            nombreCurso: element.nombreCurso,
            descripcion: element.descripcion,
            precio: element.precio,
            url: element.url,
            imagen: element.imagen,
            nombre: element.nombreUsuario,
            apellido: element.apellidoUsuario,
            puntaje: promedio,
          });
          cantidad = 0;
          acumulador = 0;
        }

        console.log(JSON.stringify(cursosArrayView));

        res.render("lista_curso_inscrito", { cursosArrayView });
      })
      .catch();
  } catch (error) {
    console.log(error);
  }
};

// Mostrar la informacion del curso inscrito
exports.infoCursoInscrito = async (req, res, next) => {
  const usuario = res.locals.usuario;
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

    // Obtener los comentarios de los usuarios
    const comentarios = await Comentario.findAll({
      where: {
        cursoId: curso.id,
      },
      include: {
        model: Usuario,
        required: true,
      },
    });

    // Obtener el promedio de puntaje del curso
    const puntajeArray = [];
    comentarios.map((comentario) => {
      puntajeArray.push(comentario.dataValues.puntaje);
    });
    // Sumar los elementos del array para obtener el promedio
    let total = puntajeArray.reduce((a, b) => a + b, 0);
    let puntajePromedio = Math.round(total / puntajeArray.length);

    console.log(puntajeArray);

    // Verificar si el usuario ya tiene comentarios
    const comentarioUsuario = await Comentario.findAll({
      where: {
        usuarioId: usuario.id,
        cursoId: curso.id,
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
      comentarioUsuario,
      puntajePromedio,
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
