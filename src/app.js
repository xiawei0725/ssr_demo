const Vue = require('vue')

module.exports = function () {
    const app = new Vue({
        router,
        data: {
            count: 1
        },
        template: `<div>
            <button @click="count++">{{count}}</button>
            <router-view></router-view>
        </div>`,
    })
    return app
}