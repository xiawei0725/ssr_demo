const express = require('express')
const Vue = require('vue')
const template = require('fs').readFileSync('./index.html', 'utf-8')
const renderer = require('vue-server-renderer').createRenderer({
    template
})
const app = express()

app.get('*', async (req, res) => {
    const vm = new Vue({
        template: `<button @click="count++">{{count}}</button>`,
        data: {
            count: 1
        },
    })
    renderer.renderToStream(vm, {
        title: 'hello vue ssr'
    }).pipe(res)
})

app.listen(3000)