const express = require('express')
const Vue = require('vue')
const template = require('fs').readFileSync('./index.html', 'utf-8')
const renderer = require('vue-server-renderer').createRenderer({
    template
})
const app = express()

app.get('*', async (req, res) => {
    const createApp = require('./src/app.js')
    renderer.renderToStream(createApp(), {
        title: 'hello vue ssr'
    }).pipe(res)
})

app.listen(3000)