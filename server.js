const express = require('express')
const fs = require('fs')
const template = fs.readFileSync('./index.html', 'utf-8')
// const renderer = require('vue-server-renderer').createRenderer({
//     template
// })

const app = express()
app.use(express.static('dist'))
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template,
    clientManifest,
})




app.get('*', async (req, res) => {
    
    renderer.renderToString({
        title:'hello vue ssr',
        url:req.url
    }, (err, html) => {
        // 处理异常……
        console.log(err);
        res.end(html)
    })
})

app.listen(3000)