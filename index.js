const express = require("express");

const exphbs = require("express-handlebars");

const routes = require("./routes");

const db = require("./config/dbdev-acad");

db.sync()
.then(() => console.log("Se conecto con el servidor de DB"))
.catch((error) => console.log(error));

const app = express();

app.engine(
    "hbs",
    exphbs({
        defaultLayout: 'main',
        extname: ".hbs"
    })
);

app.set("view engine", "hbs");

app.use("/", routes());

app.listen(7891, () => {
    console.log("Servidor ejecutandose en el puerto 7891");
});