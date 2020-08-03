// Importar el modelo de cursos
const Curso = require("../models/Curso");

// Importar el modelo de inscripcion
const Inscripcion = require("../models/Inscripcion");

// Importar el modelo de usuarios
const Usuario = require("../models/Usuario");

// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

// Importar el modelo de comentarios
const Comentario = require("../models/Comentario");

// Importar los operadores de sequelize
const { Op } = require("sequelize");

// Importar el modelo de moment
const moment = require("moment");
moment.locale("es");

// Renderizar la vista de agregar curso
exports.agregarCurso = (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  res.render("agregar_curso", { usuario, verifyAuth });
};

// Insertar el curso a la bd
exports.insertarCurso = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;

  const imagen = req.files.image[0].filename;
  /*   console.log(req.body);
      console.log(imagen); */
  const { nombre, descripcion, informacion, precio, categoria } = req.body;
  const mensajes = [];

  if (!imagen) {
    mensajes.push({
      mensaje: "Debe insertar una imagen para el curso",
      type: "alert-danger",
    });
  }
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
    res.render("agregar_curso", { mensajes, usuario, verifyAuth });
  } else {
    try {
      await Curso.create({
        nombre,
        descripcion,
        informacion,
        precio,
        categoria,
        imagen,
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
      res.render("agregar_curso", { mensajes, usuario, verifyAuth });
    }
  }
};

// Mostrar los cursos del docente
exports.listaCursoDoc = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  try {
    const cursos = await Curso.findAll({ where: { usuarioId: usuario.id } });
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
        puntaje: promedio,
      });
      cantidad = 0;
      acumulador = 0;
    }
    res.render("lista_curso_doc", { cursosArrayView, usuario, verifyAuth });
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("lista_curso_doc", { mensajes, usuario, verifyAuth });
  }
};

// Mostrar los cursos para inscribirse
exports.listaCursoAlu = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
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
        /* console.log(JSON.stringify(cursos, null, 2)); */
        res.render("lista_curso_alu", { cursosArrayView, usuario, verifyAuth });
      })
      .catch();
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("lita_curso_alu", { mensajes, usuario, verifyAuth });
  }
};

// Mostrar la informacion para cada curso si somos alumnos
exports.infoCurso = async (req, res, next) => {
  // Verificar si el usuario inicio sesion
  const usuario = res.locals.usuario;
  let verifyAuth = false;
  console.log(Object.keys(usuario).length);
  if (Object.keys(usuario).length != 0) {
    verifyAuth = true;
  }

  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url: req.params.url } });
    // Buscar el usuario que imparte el curso
    const usuarioCreado = await Usuario.findOne({
      where: { id: curso.usuarioId },
    });

    // Buscar las lecciones del curso
    const lecciones = await Leccion.findAll({
      where: { cursoId: curso.id },
    });

    // Buscar los comentarios del curso
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

    // Contar el numero de personas inscritas en el curso
    const cantidadInscritos = await Inscripcion.findAndCountAll({
      where: { cursoId: curso.id },
    });

    // Obtener la fecha de publicacion del curso
    const hace = moment(curso.dataValues.fecha).fromNow();
    res.render("info_curso", {
      curso: curso.dataValues,
      usuarioCreado: usuarioCreado.dataValues,
      lecciones,
      comentarios,
      cantidadInscritos,
      hace,
      puntajePromedio,
      usuario,
      verifyAuth,
    });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error al momento de cargar los cursos",
      type: "alert-danger",
    });
    res.render("info_curso", { mensajes, usuario, verifyAuth });
  }
};

// Mostrar la informacion para cada curso si somos docentes
exports.infoCursoDoc = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  try {
    const curso = await Curso.findOne({ where: { url: req.params.url } });
    if (curso.usuarioId != usuario.id) {
      res.redirect("/");
    } else {
      // Obtener las lecciones de acuerdo al id del curso
      const lecciones = await Leccion.findAll({
        where: { cursoId: curso.id },
      });
      // Obtener los comentarios del curso
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

      // Obtener la cantidad de alumnos inscritos
      const cantidadInscritos = await Inscripcion.findAndCountAll({
        where: { cursoId: curso.id },
      });
      /* console.log(cantidadInscritos); */
      const hace = moment(curso.dataValues.fecha).fromNow();
      res.render("info_curso_doc", {
        curso: curso.dataValues,
        lecciones,
        comentarios,
        hace,
        cantidadInscritos,
        puntajePromedio,
        usuario,
        verifyAuth,
      });
    }
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error al momento de administrar el curso",
      type: "alert-danger",
    });
    res.render("lista_curso_doc", { mensajes, usuario, verifyAuth });
  }
};
// Mostrar la vista para editar los campos
exports.cargarActualizarCurso = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const mensajes = [];
  try {
    const curso = await Curso.findByPk(req.params.id);
    res.render("actualizar_curso", {
      curso: curso.dataValues,
      usuario,
      verifyAuth,
    });
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error, el curso no puede actualizarse",
      type: "alert-danger",
    });
    res.render("actualizar_curso", { mensajes, usuario, verifyAuth });
  }
};

// Ejecutar la actualizacion
exports.actualizarCurso = async (req, res, nex) => {
  const mensajes = [];
  const usuario = res.locals.usuario;
  const verifyAuth = true;
  const { nombre, descripcion, informacion, precio, categoria } = req.body;
  try {
    // Obtener los datos del curso por actualizarse
    const curso = await Curso.findByPk(req.params.id);

    // Verificar si el usuario subio una imagen
    let imagen = "";
    if (Object.keys(req.files).length == 0) {
      imagen = curso.imagen;
    } else {
      imagen = req.files.image[0].filename;
    }

    // Verificar que campos estan vacios
    if (!nombre) {
      mensajes.push({
        mensaje: "El nombre del curso no puede ir vacio",
        type: "alert-danger",
      });
    }
    if (!descripcion) {
      mensajes.push({
        mensaje: "La descripción del curso no puede ir vacio",
        type: "alert-danger",
      });
    }
    if (!informacion) {
      mensajes.push({
        mensaje: "La información del curso no puede ir vacio",
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
      res.render("actualizar_curso", {
        mensajes,
        curso: curso.dataValues,
        usuario,
        verifyAuth,
      });
    } else {
      // Actualizamos los valores del curso
      await Curso.update(
        {
          nombre,
          descripcion,
          informacion,
          precio,
          categoria,
          imagen,
        },
        { where: { id: req.params.id } }
      );
      mensajes.push({
        mensaje: "Curso actualizado exitosamente",
        type: "alert-success",
      });

      res.redirect(`/admin_curso/${curso.url}`);
    }
  } catch (error) {
    mensajes.push({
      mensaje: "Ha ocurrido un error con la base de datos",
      type: "alert-danger",
    });
    res.render("actualizar_curso", {
      mensajes,
      usuario,
      verifyAuth,
    });
  }
};

// Buscar curso
exports.buscarCurso = async (req, res, next) => {
  const usuario = res.locals.usuario;
  let verifyAuth = false;
  if (Object.keys(usuario).length != 0) {
    verifyAuth = true;
  }

  // Obtenemos la busqueda por destructuring
  const { busqueda } = req.body;
  console.log(busqueda);
  // Realizamos la busqueda
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
        /* console.log(usuarioInscripcion); */
        const cursos = await Curso.findAll({
          where: {
            usuarioId: {
              [Op.not]: usuario.id,
            },
            id: {
              [Op.notIn]: usuarioInscripcion,
            },
            categoria: {
              [Op.like]: `%${busqueda}%`,
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
        /* console.log(JSON.stringify(cursos, null, 2)); */
        res.render("busqueda", { cursosArrayView, usuario, verifyAuth });
      })
      .catch();
  } catch {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("busqueda", { mensajes, usuario, verifyAuth });
  }
};
exports.buscarCursoGeneral = async (req, res, next) => {
  const usuario = res.locals.usuario;
  const verifyAuth = false;
  const mensajes = [];
  const { busqueda } = req.body;
  try {
    const cursos = await Curso.findAll({
      where: {
        categoria: {
          [Op.like]: `%${busqueda}%`,
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
    res.render("busqueda", { cursosArrayView, usuario, verifyAuth });
  } catch (error) {
    mensajes.push({
      mensaje: "No se han logrado cargar los datos",
      type: "alert-danger",
    });
    res.render("busqueda", { mensajes, usuario, verifyAuth });
  }
};

// Buscar los cursos de acuerdo a las categorias
exports.cursoCategoria = async (req, res, next) => {
  const usuario = res.locals.usuario;
  let verifyAuth = false;
  const busqueda = req.params.categoria;

  // Realizamos la busqueda
  const usuarioInscripcion = [];
  const mensajes = [];
  if (Object.keys(usuario).length == 0) {
    try {
      const cursos = await Curso.findAll({
        where: {
          categoria: {
            [Op.like]: `%${busqueda}%`,
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
      res.render("busqueda", { cursosArrayView, usuario, verifyAuth });
    } catch (error) {
      mensajes.push({
        mensaje: "No se han logrado cargar los datos",
        type: "alert-danger",
      });
      res.render("busqueda", { mensajes, usuario, verifyAuth });
    }
  } else {
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
              categoria: {
                [Op.like]: `%${busqueda}%`,
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
          /* console.log(JSON.stringify(cursos, null, 2)); */
          res.render("busqueda", { cursosArrayView, usuario, verifyAuth });
        })
        .catch();
    } catch {
      mensajes.push({
        mensaje: "No se han logrado cargar los datos",
        type: "alert-danger",
      });
      res.render("busqueda", { mensajes, usuario, verifyAuth });
    }
  }
};
