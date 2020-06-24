// const routes = require("../routes");
const Usuario = require("../models/Usuario");

exports.signUp = (req, res, next) => {
    res.render("signUp");
};

exports.signUpVerify = (req, res, next) => {
    const { nombre, apellido, email, user, password } = req.body;
    const mensajes = [];

    if(!nombre)
    {
        mensajes.push({error : "Ud tiene que tener un nombre",
        type: "alert-danger"});
    }
    if(!apellido)
    {
        mensajes.push({error : "Ud tiene que tener un apellido",
        type: "alert-danger"});
    }
    if(!email)
    {
        mensajes.push({error : "Tiene que ingresar un correo",
        type: "alert-danger"});
    }
    if(!user)
    {
        mensajes.push({error : "El usuario no puede estar vacio",
        type: "alert-danger"});
    }
    if(!password)
    {
        mensajes.push({error : "La contraseña no puede estar vacia",
        type: "alert-danger"});
    }

    // Si hay mensajes
    if(mensajes.length)
    {
        res.render("signUp", {
           mensajes 
        });
    }
    else
    {
        Usuario.create({nombre, apellido, email, user, password});
        mensajes.push({
            error: `Se ha registrado correctamente ${user}`,
            type: "alert-success"
        });
        res.render("signUp", {
            mensajes
        });
    }
};