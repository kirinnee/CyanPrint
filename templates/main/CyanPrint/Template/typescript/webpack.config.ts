import * as webpack from 'webpack';

let config: webpack.Configuration = {
    entry: {"cyan.config": './cyan.config.ts'},
    mode: 'production',
    resolve: {extensions: ['.ts', '.tsx', '.js']},
    output: {filename: '[name].js', path: __dirname, libraryTarget:"umd",globalObject: "(typeof window !== 'undefined' ? window : this)"},
    module: {rules: [{test: /\.tsx?$/, use: 'ts-loader'}]},
    node: {__dirname: false, __filename: false}
};
export default config;