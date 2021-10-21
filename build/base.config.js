const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
    mode: 'development',
    output: {
        filename: '[name].bundle.js',
        publicPath:'/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {
                        loader: 'css-loader',

                    }
                ]
            }
        ]

    },
    plugins: [
        new VueLoaderPlugin()
    ]
}