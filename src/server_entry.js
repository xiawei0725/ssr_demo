import createApp from './app.js'

export default (ctx) => {
    return new Promise((resolve, reject) => {
        const { app, router } = createApp()
        router.push(ctx.url)
        router.onReady(function () {
            resolve(app)
        })
    })
}