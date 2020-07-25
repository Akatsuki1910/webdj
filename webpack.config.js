const path = require('path');
module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "umd"
  },
  module: {
    loaders: [{
      test: /\.wasm$/,
      loaders: ['wasm-loader']
    }]
  },
  mode: "development"
};