// Importar controlador de cursos
const Curso = require("../models/Curso");
const Inscripcion = require("../models/Inscripcion");
const Usuario = require("../models/Usuario");
const Comentario = require("../models/Comentario");
const { Op } = require("sequelize");

const routes = require("../routes");

exports.home = async (req, res, next) => {
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
        res.render("home", { cursos });
      })
      .catch();
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("home", { mensajes });
  }
};

exports.inicio = async (req, res, next) => {
  const usuario = res.locals.usuario;
  let verifyAuth = false;
  const usuarioInscripcion = [];
  const mensajes = [];
  console.log(Object.keys(usuario).length);
  if (Object.keys(usuario).length != 0) {
    verifyAuth = true;

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
          /* console.log(usuarioInscripcion); */
          const cursos = await Curso.findAll({
            where: {
              usuarioId: {
                [Op.not]: usuario.id,
              },
              id: {
                [Op.notIn]: usuarioInscripcion,
              },
            },
            include: {
              model: Usuario,
              required: true,
            },
          });

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
            for (let y = 0; y < comentariosArray.length; y++) {
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
          /* console.log(JSON.stringify(cursos, null, 2)); */
          res.render("inicio", { cursosArrayView, usuario, verifyAuth });
        })
        .catch();
    } catch {
      mensajes.push({
        mensaje: "No se han logrado cargar los datos",
        type: "alert-danger",
      });
      res.render("inicio", { mensajes, usuario, verifyAuth });
    }
  } else {
    res.render("inicio", { mensajes, usuario, verifyAuth });
  }
};
