// Importar nodemailer para mandar el correo a través del puerto
const nodemailer = require("nodemailer");

// Importar configuracion de mailtrap.io
const mailtrapConfig = require("../config/email");

// Importar Handlebars
const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");

// Realizar el vio del correo electronico mediante nodemail hacia mailtrap
exports.enviarCorreo = async (opciones) => {
    // Crear nuestro transportador SMTP reutilizable
    const transporter = nodemailer.createTransport(
        {
            host: mailtrapConfig.host,
            port: mailtrapConfig.port,
            secure: false, // true para 465 puerto, false para otro puertos
            auth: {
                user: mailtrapConfig.user,
                pass: mailtrapConfig.pass
            }
        }
    );

    //Obtener y construir el template del correo electronico
    fs.readFile(
        path.resolve(__dirname, "../views/emails/restablecer_correo_electrónico.hbs"),
        "utf8",
        async function (error, source) {
            if (error) {
                console.log("No se puede cargar el template correcto");
                throw error;
            }

            // Generar un html para el cuerpo del correo
            const data = {
                usuario: opciones.usuario.usuario,
                resetUrl: opciones.resetUrl
            };

            // Decirle el template
            const template = hbs.compile(source.toString());
            const html = template(data);

            // Enviar el correo electrónico
            const info = await transporter.sendMail(
                {
                    from: "Dev Acad <noreply@devacad.es>",
                    to: opciones.usuario.email, // Lista que recibe la direccion
                    subject: opciones.subject, // Asunto
                    text: opciones.text, // Plain text o el body
                    html
                }
            );
        }
    );
};