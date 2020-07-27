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
    res.render("agregar_curso");
};

// Insertar el curso a la bd
exports.insertarCurso = async (req, res, next) => {
    const usuario = res.locals.usuario;
    const imagen = req.file.filename;
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
        res.render("agregar_curso", { mensajes });
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
                /* console.log(JSON.stringify(cursos, null, 2)); */
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
        });
    } catch (error) {
        mensajes.push({
            mensaje: "Ha ocurrido un error al momento de cargar los cursos",
            type: "alert-danger",
        });
    }
};

// Mostrar la informacion para cada curso si somos docentes
exports.infoCursoDoc = async (req, res, next) => {
    const usuario = res.locals.usuario;
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
            });
        }
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
    const { nombre, descripcion, informacion, precio, categoria } = req.body;

    // Asignar la variable de la imagen para uso local
    let imagen = "";
    try {
        imagen = req.file.filename;
    } catch (error) {
        /* console.log(error); */
        console.log("No viene imagen, dara error en la consola XD");
    }

    ////////////////////////////////
    if (imagen) {
        // Insercion en la base con imagenes
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
            const curso = await Curso.findByPk(req.params.id);
            res.render("actualizar_curso", { mensajes, curso: curso.dataValues });
        } else {
            try {
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

                const curso = await Curso.findByPk(req.params.id);
                res.redirect(`/admin_curso/${curso.url}`);
                /* res.render("actualizar_curso", { mensajes }); */
            } catch {
                mensajes.push({
                    mensaje: "Ha ocurrido un error con la base de datos",
                    type: "alert-danger",
                });
                res.render("agregar_curso", { mensajes });
            }
        }
    }
    else {
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
            const curso = await Curso.findByPk(req.params.id);
            res.render("actualizar_curso", { mensajes, curso: curso.dataValues });
        } else {
            try {
                await Curso.update(
                    {
                        nombre,
                        descripcion,
                        informacion,
                        precio,
                        categoria,
                        /* imagen, */
                    },
                    { where: { id: req.params.id } }
                );
                mensajes.push({
                    mensaje: "Curso actualizado exitosamente",
                    type: "alert-success",
                });

                const curso = await Curso.findByPk(req.params.id);
                res.redirect(`/admin_curso/${curso.url}`);
                /* res.render("actualizar_curso", { mensajes }); */
            } catch {
                mensajes.push({
                    mensaje: "Ha ocurrido un error con la base de datos",
                    type: "alert-danger",
                });
                res.render("agregar_curso", { mensajes });
            }
        }
    }
};
// Mostrar la lista de los