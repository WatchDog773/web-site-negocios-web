// Importar path para obtener la ruta absoluta del arbol de direcciones
const path = require("path");

// Importar Webpack
const webpack = require("webpack");

module.exports = {
  // punto de entrada de los archivos js
  entry: "./public/js/app.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "./public/dist"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
