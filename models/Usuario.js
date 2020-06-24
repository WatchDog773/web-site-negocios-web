const Sequelize = require("sequelize");

const db = require("../config/dbdev-acad");

const Usuario = db.define("usuario", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoincrement: true
    },
    nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Debes ingresar tu nombre completo",
          },
        },
    },
    apellido: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Debes ingresar tu nombre completo",
          },
        },
    },
    email: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: {
          args: true,
          msg: "Ya existe un usuario registrado con esta dirección de correo",
        },
        validate: {
          notEmpty: {
            msg: "Debes ingresar un correo electrónico",
          },
          isEmail: {
            msg: "Verifica que tu correo es un correo electrónico válido",
          },
        },
    },
    user: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Debes ingresar tu nombre completo",
          },
        },
    },
    password: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar una contraseña",
        },
      },
    },
    /* token: Sequelize.STRING,
    expiration: Sequelize.DATE, */
  }
/*     {
      hooks: {
      beforeCreate(usuario) {
          // Realizar el hash del password
          // https://www.npmjs.com/package/bcrypt
          usuario.password = bcrypt.hashSync(
          usuario.password,
          bcrypt.genSaltSync(13)
          );
      },
      },
  } */
);

module.exports = Usuario;