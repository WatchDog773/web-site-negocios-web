// Importar sequelize
const Sequelize = require("sequelize");

// Importar el shortid y el slug
const slug = require("slug");
const shortid = require("shortid");

// Traer la conexion a la base de datos
const db = require("../config/dbdev-acad");

// Tabla de leccion
const Leccion = db.define(
  "leccion",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: Sequelize.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar el nombre de la leccion",
        },
      },
    },

    descripcion: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La leccion debe tener una descripcion",
        },
      },
    },

    url: {
      type: Sequelize.STRING,
    },

    video: {
      type: Sequelize.STRING,
    },

    estado: {
      type: Sequelize.BOOLEAN,
    },
  },

  {
    hooks: {
      beforeCreate(leccion) {
        const url = slug(leccion.nombre).toLowerCase();
        leccion.url = `${url}_${shortid.generate()}`;
        console.log("Ejecutando before create en leccion");
      },

      beforeUpdate(leccion) {
        const url = slug(leccion.nombre).toLowerCase();
        curso.url = `${url}_${shortid.generate()}`;
        console.log("Ejecutando before update en leccion");
      },
    },
  }
);

module.exports = Leccion;
