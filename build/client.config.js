const path = require('path')
const { merge } = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const base = require('./base.config.js')
module.exports = merge(base, {
    entry: {
        client: path.resolve(__dirname, '../src/client_entry.js')
    },
    plugins: [
        new VueSSRClientPlugin()
    ]
})