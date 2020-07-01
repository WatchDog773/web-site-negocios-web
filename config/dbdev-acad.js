const Sequelize = require("sequelize");

require("dotenv").config({ path: "variables.env" });

// Parametros para la base de datos
const db = new Sequelize(
  "dbdev-acad",
  process.env.MYSQLUSER,
  process.env.MYSQLPASS,
  {
    host: "localhost",
    dialect: "mysql",
    port: process.env.MYSQLPORT,
    operatorAliases: false,
    define: {
      timestamps: false,
    },
    pool: {
      acquire: 30000,
      idle: 10000,
      min: 0,
      max: 5,
    },
  }
);

module.exports = db;
