// Importar nodemailer para mandar el correo a través del puerto
const nodemailer = require("nodemailer");

// Importar configuracion de mailtrap.io
const mailtrapConfig = require("../config/email");

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

    // Generar un html para el cuerpo del correo
    // TODO: Crear un archivo HTML 
    const html = "<html><body><h1>Prueba Dev Acad</h1></body></html>";

    // Enviar el correo electrónico
    const info = await transporter.sendMail(
        {
            from: "Dev - Acad <noreply@devacad.es>",
            to: opciones.usuario.email, // Lista que recibe la direccion
            subject: opciones.subject, // Asunto
            text: opciones.text, // Plain text o el body
            html
        }
    );
};