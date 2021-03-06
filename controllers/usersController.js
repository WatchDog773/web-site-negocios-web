// const routes = require("../routes");
const Usuario = require("../models/Usuario");

exports.signUpCharge = (req, res, next) => {
  res.render("signUp", { layout: "auth" });
};

// Verificacion y creacion de un nuevo usuario
// La conexion es asincrona con async / await
exports.signUpVerify = async (req, res, next) => {
  /* console.log(req.body); */

  const { nombre, apellido, email, user, password, password_verify } = req.body;
  const usuario = user;
  const mensajes = [];

  // un objeto temporal
  // https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Trabajando_con_objectos
  const temp = {
    _nombre: nombre,
    _apellido: apellido,
    _email: email,
    _user: user,
  };

  if (password != password_verify) {
    mensajes.push({
      mensaje: "Las contraseñas no coinciden",
      type: "alert-warning",
    });
  }
  if (!password_verify) {
    mensajes.push({
      mensaje: "Tienes que confirmar la contraseña",
      type: "alert-danger",
    });
  }
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
    /* console.log(temp._apellido); */
    res.render("signUp", {
      layout: "auth",
      mensajes,
      temp,
    });
    delete temp;
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
        temp,
      });
      delete temp;
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
  const verifyAuth = true;
  res.render("actualizar_perfil", { usuario, verifyAuth });
};

exports.actualizarPerfil = async (req, res, next) => {
  const mensajes = [];
  const usuarioSesion = res.locals.usuario;
  const verifyAuth = true;
  const { nombre, apellido, email, usuario } = req.body;
  if (!nombre) {
    mensajes.push({
      mensaje: "El nombre no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!apellido) {
    mensajes.push({
      mensaje: "El apellido no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!email) {
    mensajes.push({
      mensaje: "El email no puede ir vacio.",
      type: "alert-danger",
    });
  }
  if (!usuario) {
    mensajes.push({
      mensaje: "El usuario no puede ir vacio.",
      type: "alert-danger",
    });
  }
  // Verificar si hay errores
  if (mensajes.length) {
    res.render("actualizar_perfil", {
      mensajes,
      usuarioSesion,
      usuario: usuarioSesion,
      verifyAuth,
    });
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
      res.render("actualizar_perfil", {
        mensajes,
        usuarioSesion,
        usuario: usuarioSesion,
        verifyAuth,
      });
    } catch (error) {
      mensajes.push({
        mensaje: "Ha ocurrido un erro al momento de actualizar la informacion.",
        type: "alert-danger",
      });
      res.render("actualizar_perfil", {
        mensajes,
        usuarioSesion,
        usuario: usuarioSesion,
        verifyAuth,
      });
    }
  }
};

// Formulario de restablecer contraseña
exports.cargarFormularioRestablecerPassword = async (req, res, next) => {
  verifyAuth = false;
  res.render("restablecer_password", { verifyAuth });
};
