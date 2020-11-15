
const path = require('path');

const ExtensionReloader = require('webpack-extension-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background',
        content: './src/content'
    },
    output: {
        filename: 'lisbeth-[name].js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/manifest.json' },
                { from: 'src/popup.html', to: 'popup.html' },
                { from: 'src/popup.css', to: 'popup.css' },
            ]
        })
    ]
};
