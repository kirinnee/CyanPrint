import {Options} from "webpack";
const TerserPlugin = require('terser-webpack-plugin'); 

let opti : Options.Optimization = {};

opti = {
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