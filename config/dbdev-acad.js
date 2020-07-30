const Sequelize = require("sequelize");

require("dotenv").config({ path: "variables.env" });

// Parametros para la base de datos
const db = new Sequelize(
  process.env.MYSQLDB,
  process.env.MYSQLUSER,
  process.env.MYSQLPASS,
  {
    host: process.env.MYSQLSERVERURL,
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
