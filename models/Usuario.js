const Sequelize = require("sequelize");

const db = require("../config/dbdev-acad");

const bcrypt = require("bcrypt-nodejs");

const Usuario = db.define(
    "usuario",
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: true},

        nombre: {type: Sequelize.STRING(20), allowNull: false, validate: {
            notEmpty: {msg: "Debes ingresar tu nombre"}
        },},

        apellido: {type: Sequelize.STRING(20), allowNull: false, validate: {notEmpty: {msg: "Debes ingresar tu apellido"}}},

        email: {type: Sequelize.STRING(120), allowNull: false, unique: {
            args: true, 
            msg: "Ese correo electronico ya tiene un usuario",
        }, validate: {
            notEmpty: {msg: "Debe ingresar un correo electronico"},
            isEmail: {msg: "Correo electronico no valido"},
        },},

        usuario: {
            type: Sequelize.STRING(30),
            allowNull: false,
            validate: {
                notEmpty: {msg: "Debe ingresar su usuario"}
            },
            unique: {
                arg: true,
                msg: "Este usuario ya existe",
            },
        },

        password: {
            type: Sequelize.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {msg: "Debe ingresar su contraseña"}
            },
        },
    },
    {
        hooks: {
            beforeCreate(usuario) {
                // Realizar el hash de la contraseña o password
                usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(13));
            },
        }
    }
);

// Metodo personalizado para hash
// Permite agregar metodos aparte
// Verificar si el password enviado (sin hash) es igual al almacenado
Usuario.prototype.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = Usuario;

// El usuario tendra muchos videos
// Falta agregar el modelo
