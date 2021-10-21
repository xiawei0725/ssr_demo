const createApp = require('./app.js')


module.exports = ctx => {
    return new Promise((resolve, reject) => {
        const { app, router } = createApp(ctx)
        router.push(ctx.url)
        router.onReady(() => {
            resolve(app)
        })
    })
}