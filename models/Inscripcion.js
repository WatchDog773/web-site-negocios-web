// Importar Sequelize
const Sequelize = require("sequelize");

// Importar la base de datos
const db = require("../config/dbdev-acad");

const Inscripcion = db.define(
  "inscripcion",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: Sequelize.DATE,
    },
  },
  {
    hooks: {
      beforeCreate(inscription) {
        const fecha = new Date();
        inscription.fecha = fecha.toISOString();
      },
    },
  }
);

module.exports = Inscripcion;
