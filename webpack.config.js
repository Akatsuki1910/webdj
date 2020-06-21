const path = require('path');
module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    loaders: [{
      test: /\.wasm$/,
      loaders: ['wasm-loader']
    }]
  },
  mode: "development"
};