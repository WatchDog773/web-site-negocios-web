const routes = require("../routes");

exports.user = (req, res, next) => {
    res.render("start");
};

exports.respuesta = (req, res, next) => {
    const { nombre, apellido, email, user, password } = req.body;
    console.log(req.body);
};