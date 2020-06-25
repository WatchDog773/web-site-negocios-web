// Import passport js
const passport = require("passport");

// Usar la estrategia local
const LocalStategy = require("passport-local");

// Improtar la referencia del modelo que contiene los datos de authenticacion
const Usuario = require("../models/Usuario");

// Definir la estrategia de auth
passport.use (
    new LocalStategy(
        // Por defecto requiere de un user o correo en este caso y de una contraseña
        {
            usernameField: "email",
            passwordField: "password"
        },
        // Verificar los datos enviados en la pagina son correctos
        async (email, password, done) => {
            try {
                // Regresar la busqueda del user o usuario
                const usuario = await Usuario.findOne(
                    {
                        where: {email}
                    }
                );

                // Verificar la contrasenia
                // Si fuera incorrecta
                if (!usuario.comparePassword(password)) {
                    return done(null, false,
                        {
                            message: "Nombre o contraseña incorrecta"
                        }
                        );
                }

                // Si la contrasenia fuera correcta
                return done(null, usuario);

            } catch (error) {
                // El usuario no existe
                return done(null, false,
                    {
                        message: "La cuenta de correo electronico no se encuentra registrada"
                    }
                );
            }
        }
    )
);

// Serializar el usuario
passport.serializeUser((usuario, callback) =>
    {
        callback(null, usuario);
    }
);

// Deserializar el usuario
passport.deserializeUser((usuario, callback) =>
    {
        callback(null, usuario);
    }
);

exports.module = passport;