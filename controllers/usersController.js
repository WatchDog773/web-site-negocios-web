// const routes = require("../routes");
const Usuario = require("../models/Usuario");

exports.signUpCharge = (req, res, next) => {
  res.render("signUp", { layout: "auth" });
};

// Verificacion y creacion de un nuevo usuario
// La conexion es asincrona con async / await
exports.signUpVerify = async (req, res, next) => {
  /* console.log(req.body); */

  const { nombre, apellido, email, user, password } = req.body;
  const usuario = user;
  const mensajes = [];

  if (!nombre) {
    mensajes.push({
      mensaje: "Ud tiene que tener un nombre",
      type: "alert-danger",
    });
  }
  if (!apellido) {
    mensajes.push({
      mensaje: "Ud tiene que tener un apellido",
      type: "alert-danger",
    });
  }
  if (!email) {
    mensajes.push({
      mensaje: "Tiene que ingresar un correo",
      type: "alert-danger",
    });
  }
  if (!user) {
    mensajes.push({
      mensaje: "El usuario no puede estar vacio",
      type: "alert-danger",
    });
  }
  if (!password) {
    mensajes.push({
      mensaje: "La contraseña no puede estar vacia",
      type: "alert-danger",
    });
  }

  // Si hay mensajes
  if (mensajes.length) {
    res.render("signUp", {
      layout: "auth",
      mensajes,
    });
  } else {
    try {
      // Insertar en la base de datos
      await Usuario.create({ nombre, apellido, email, usuario, password });

      mensajes.push({
        mensaje: "Se inserto en la base de datos",
        type: "alert-success",
      });

      res.redirect("/iniciar_sesion");

      // res.render("login", {
      //     layout: "auth",
      //     mensajes
      // });
    } catch (error) {
      mensajes.push({
        mensaje: "No se pudo registrar, verifica la consola",
        type: "alert-danger",
      });

      res.render("signUp", {
        layout: "auth",
        mensajes,
      });

      console.log(error);
    }
  }
};

//Iniciar sesion
exports.loginCharge = (req, res, next) => {
  const mensajes = res.locals.mensajes;
  res.render("login", {
    layout: "auth",
    mensajes,
  });
};

// Llamar los usuarios (por si se necesita)
exports.allUsers = async (req, res, next) => {
  const mensajes = [];

  try {
    const usuarios = await Usuario.findAll();
  } catch (error) {
    mensajes.push({
      error: error,
      type: "alert-danger",
    });
  }
};

// Ver informacion del usuario
exports.verPerfilUsuario = async (req, res, next) => {
  const usuario = res.locals.usuario;
  res.render("actualizar_perfil", { usuario });
};

exports.actualizarPerfil = async (req, res, next) => {
  const mensajes = [];
  const usuarioSesion = res.locals.usuario;
  const { nombre, apellido, email, usuario } = req.body;
  if (!nombre) {
    mensajes.push({
      mensaje: "El nombre no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!apellido) {
    mensajes.push({
      mensaje: "El nombre no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!email) {
    mensajes.push({
      mensaje: "El nombre no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!usuario) {
    mensajes.push({
      mensaje: "El nombre no puede ir vacio.",
      type: "alert-danger",
    });
  }
  // Verificar si hay errores
  if (mensajes.length) {
    res.render("actualizar_perfil", { mensajes, usuarioSesion });
  } else {
    try {
      await Usuario.update(
        { nombre, apellido, email, usuario },
        { where: { id: usuarioSesion.id } }
      );
      mensajes.push({
        mensaje:
          "La informacion se ha actualizado exitosamente, es necesario que cierres tu sesion y vuelvas a iniciar",
        type: "alert-success",
      });
      res.render("actualizar_perfil", { mensajes, usuarioSesion });
    } catch (error) {
      mensajes.push({
        mensaje: "Ha ocurrido un erro al momento de actualizar la informacion.",
        type: "alert-danger",
      });
      res.render("actualizar_perfil", { mensajes, usuarioSesion });
    }
  }
};
