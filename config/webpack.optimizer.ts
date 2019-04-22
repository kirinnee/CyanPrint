import {Options} from "webpack";

const TerserPlugin = require('terser-webpack-plugin');

let opti: Options.Optimization = {
	minimizer: [
		new TerserPlugin({
			terserOptions: {
				compress: {
					unsafe: false
				},
				output: {comments: false},
				toplevel: false
			}
		})
	]
};

export {opti};
