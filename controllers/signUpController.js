const routes = require("../routes");

exports.signUp = (req, res, next) => {
    res.render("signUp");
};

exports.signUpVerify = (req, res, next) => {
    const { nombre, apellido, email, user, password } = req.body;
    const errores = [];

    if(!nombre)
    {
        errores.push({error : "Ud tiene que tener un nombre"});
    }
    if(!apellido)
    {
        errores.push({error : "Ud tiene que tener un apellido"});
    }
    if(!email)
    {
        errores.push({error : "Tiene que ingresar un correo"});
    }
    if(!user)
    {
        errores.push({error : "El usuario no puede estar vacio"});
    }
    if(!password)
    {
        errores.push({error : "La contraseña no puede estar vacia"});
    }

    // Si hay errores
    if(errores.length)
    {
        res.render("signUp", {
           errores 
        });
    }
    else
    {
        res.send(user);
    }
};