// Importar sequelize
const Sequelize = require("sequelize");

// Importar configuracion de la base de datos
const db = require("../config/dbdev-acad");

// Declaramos la tabla de comentario
const Comentario = db.define(
  "comentario",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comentario: {
      type: Sequelize.TEXT,
    },
    puntaje: {
      type: Sequelize.INTEGER,
    },
    fecha: {
      type: Sequelize.DATE,
    },
  },
  {
    hooks: {
      beforeCreate(comentario) {
        const fecha = new Date();
        comentario.fecha = fecha.toISOString();
      },
    },
  }
);

module.exports = Comentario;
