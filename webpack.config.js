var CopyWebpackPlugin = require('copy-webpack-plugin')
var path = require('path')
var webpack = require('webpack')

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        './index'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: (process.env.NODE_ENV === 'production') 
            ? 'js/bundle.js' : 'bundle.js',
        publicPath: '/js/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin([
            { from: 'css', to: 'css' },
            { from: 'images', to: 'images' },
            { from: 'index.html' }
        ])
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                exclude: /node_modules/,
                include: __dirname
            }
        ]
    }
}
