import {Options} from "webpack";

const TerserPlugin = require('terser-webpack-plugin');

let opti: Options.Optimization = {
	minimizer: [
		new TerserPlugin({
			terserOptions: {
				compress: {
					unsafe: true
				},
				output: {comments: false},
				toplevel: true
			}
		})
	]
};

export {opti};
