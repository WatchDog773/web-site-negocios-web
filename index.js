const express = require("express");

const routes = require("./routes");

const app = express();

app.use("/", routes());

app.listen(7891, () => {
    console.log("Servidor ejecutandose en el puerto 7891");
});