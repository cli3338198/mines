const path = require("path");

// use node.js package system, because webpack will be read by node.js
module.exports = {
  entry: "./src/index.ts", // relative path to the entry file
  module: {
    rules: [
      {
        test: /\.ts$/, // test for a typescript file
        use: "ts-loader", // compile ts file to js
        include: [path.resolve(__dirname, "src")], // where to apply this rule, where the ts files will be
      },
    ],
  },
  output: {
    filename: "bundle.js", // name of output file that webpack bundles
    path: path.resolve(__dirname, "dist"), // absolute path to output directory
  },
};
