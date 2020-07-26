// Importar el modelo de leccion
const Leccion = require("../models/Leccion");

// Importar el modelo de curso
const Curso = require("../models/Curso");

// Importar sequelize
const Sequelice = require("sequelize");

exports.cargarFormularioInsertarLeccion = async (req, res, next) => {
    /* res.send(req.params.id); */
    try {
        usuario = res.locals.usuario;
        const curso = await Curso.findOne({
            where: { id: req.params.id },
        });
        console.log(usuario.id);
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

            // Buscar la url del curso mediante el id
            const curso = await Curso.findOne(
                {
                    where: { id: cursoId }
                }
            );

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
        const leccion = await Leccion.findOne({
            where: { url: req.params.url }
        });

        const curso = await Curso.findOne(
            {
                where: { id: req.params.cursoId }
            }
        );

        res.render("actualizar_leccion", { leccion: leccion.dataValues, curso: curso.dataValues });
    } catch (error) {
        res.send("Ocurrio un error, contacta con el administrador (consola)");
        console.log(error);
    }
};

exports.actualizarLeccion = async (req, res, next) => {
    /* res.send(req.params.cursoUrl); */
    const { nombre, descripcion } = req.body;
    const mensajes = [];

    if (!nombre) {
        mensajes.push(
            {
                error: "La leccion debe tener un nombre",
                type: "alert-danger"
            }
        );
    }
    if (!descripcion) {
        mensajes.push(
            {
                error: "La leccion debe tener una descripcion",
                type: "alert-danger"
            }
        );
    }

    // Si hay errores
    if (mensajes.length) {
        res.render("actualiza_leccion", { mensajes });
    }
    else {
        try {
            await Leccion.update(
                {
                    nombre,
                    descripcion
                },
                {
                    where: { id: req.params.id }
                }
            );

            mensajes.push(
                {
                    error: "Leccion Actualizado correctamente",
                    type: "alert-success"
                }
            );

            /* res.redirect("/lista_curso_doc"); */
            res.redirect(`/admin_curso/${req.params.cursoUrl}`);
        } catch (error) {
            res.send("Ocurrio un error, contacta con el administrador (consola)");
            console.log(error);
        }
    }

};