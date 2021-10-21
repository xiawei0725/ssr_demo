const path = require('path')
const { merge } = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const base = require('./base.config.js')
module.exports = merge(base, {
    entry: {
        client: path.resolve(__dirname, '../src/server_entry.js')
    },
    target: 'node',
    output: {
        libraryTarget: 'commonjs2'
    },
    plugins: [
        new VueSSRServerPlugin()
    ]
})