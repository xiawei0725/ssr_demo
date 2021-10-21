const Vue = require('vue')
const VueRouter = require('vue-router')
Vue.use(VueRouter)


function createRouter() {
    return new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/about',
                component: { template: '<div>about page</div>' }
            }
        ]
    })
}


module.exports = createRouter