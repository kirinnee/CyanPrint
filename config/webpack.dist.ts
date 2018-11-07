import * as path from "path";
import {opti} from "./webpack.optimizer";
import webpack, {Entry} from "webpack";
import {rules} from "./webpack.rules";
import {Kore} from "@kirinnee/core";

let core = new Kore();
core.ExtendPrimitives();

let entry:Entry = {
	"cyan": "./src/cyanprint.ts"
};


function GenerateConfig(entry: Entry, filename: string, mode: "development"|"production"|"none") : webpack.Configuration {
    let outDir = path.resolve(__dirname,  "../dist");
    let config : webpack.Configuration = {
        entry: entry,
        output: {
            path: outDir,
            filename: filename,
            libraryTarget: "umd",
            globalObject: "(typeof window !== 'undefined' ? window : this)"
        },
	    resolve: {
		    extensions: ['.ts', '.tsx', '.js']
	    },
	    plugins: [new webpack.BannerPlugin({banner: "#!/usr/bin/env node", raw: true})],
        mode: mode,
        devtool: "source-map", 
        module: {rules: rules},
	    target:"node",
	    node: {__dirname: false, __filename: false}
    };
	if (mode === "production") config.optimization = opti;
    return config;
}


module.exports = [
    GenerateConfig(entry, '[name].min.js', 'production'),
    GenerateConfig(entry, '[name].js', 'development')
];