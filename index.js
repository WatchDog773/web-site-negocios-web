// Importar los modulos de express.js
const express = require("express");

// Importar handlebars como template engine
const exphbs = require("express-handlebars");

// Importar body-parser para el manejo de peticiones en el cuerpo http
const bodyParser = require("body-parser");

// Importar el manejador de rutas
const routes = require("./routes");

// Importar passport para el inicio de sesion
const passport = require("./config/passport");

// Importar express-session para manejar las sesiones de usuario
const session = require("express-session");

// Se necesita cookie parser para habilitar el manejo de cookies
const cookieParser = require("cookie-parser");

// Importar connect flash
const flash = require("connect-flash");

// Importar multer para subir imagenes al servidor
const multer = require("multer");

// Importar path para obtener las rutas en donde se subiran los archivos
const path = require("path");

// Importar la configuracion de la base de datos
const db = require("./config/dbdev-acad");

// Importar los modelos
require("./models/Usuario");
require("./models/Curso");

// Realizar la conexión de la base de datos mediante promesas
db.sync()
  .then(() =>
    console.log(
      "===================== Se conecto con el servidor de DB =============="
    )
  )
  .catch((error) => console.log(error));

// Crear el servidor de express
const app = express();

// Indicarle al servidor la carpeta en donde estaran ubicados
//nuestros archivos estaticos
app.use(express.static("public"));

// Indicar que template engine se va a utilizar
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");

// Habilitar bodyparser para leer los datos enviados por POST
app.use(bodyParser.urlencoded({ extended: true }));

// Indicarle al servidor en que ruta se subiran los archivos
const storage = multer.diskStorage({
  destination: path.join(__dirname, "/public/uploads/img"),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Enviamos la ruta en donde se guardaran los archivos y el nombre del input
// que guardara la imagen en el servidor
app.use(multer({ storage }).single("image"));

// Habilitar el uso de cookie parser
app.use(cookieParser());

// Habilitar las sesiones del usuario
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//Habilitar connect flash para compartir mensajes
app.use(flash());

//Crear instancia de passport y cargar la estrategia
app.use(passport.initialize());
app.use(passport.session());

// Pasar valores mediante el middleware
app.use((req, res, next) => {
  res.locals.usuario = { ...req.user } || null;
  res.locals.mensajes = req.flash();
  next();
});

// Indicarle a express donde están las rutas del servidor
app.use("/", routes());

// Inicializar el servidor en un puerto en especifico
app.listen(7891, () => {
  console.log(
    "================== Servidor ejecutandose en el puerto 7891 ======================"
  );
});
