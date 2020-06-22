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
        port: process.env.PORT,
        operationAliases: false,
        define: {
            timestamp: false
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = db;