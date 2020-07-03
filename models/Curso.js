// Importar Sequelize
const Sequelize = require("sequelize");

// Importar modulo de inscripciones

// Importar slug y short id para generar URL's
const slug = require("slug");
const shortid = require("shortid");

const Inscripcion = require("./Inscripcion");

// Importar la conexion a la base de datos
const db = require("../config/dbdev-acad");

// Declaramos la tabla Curso
const Curso = db.define(
  "curso",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
    },
    descripcion: {
      type: Sequelize.STRING,
    },
    precio: {
      type: Sequelize.FLOAT,
    },
    categoria: {
      type: Sequelize.STRING,
    },
    url: {
      type: Sequelize.STRING,
    },
  },
  {
    hooks: {
      beforeCreate(curso) {
        const url = slug(curso.nombre).toLocaleLowerCase();
        curso.url = `${url}_${shortid.generate()}`;
        console.log("Ejecutando before create en curso");
      },
      beforeUpdate(curso) {
        const url = slug(curso.nombre).toLocaleLowerCase();
        curso.url = `${url}_${shortid.generate()}`;
        console.log("Ejecutando before create en curso");
      },
    },
  }
);
Curso.hasMany(Inscripcion);

module.exports = Curso;
