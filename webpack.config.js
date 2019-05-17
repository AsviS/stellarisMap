let path = require("path");
let conf = {
	entry: "./src/main.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		overlay: true
	},
	node: {
		fs: "empty"
	}
};

module.exports = conf;