import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import About from '../views/About.vue'
import Home from '../views/Home.vue'

function createRouter() {
    return new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/about',
                component: About
            },
            {
                path: '/',
                component: Home
            }
        ]
    })
}


export default createRouter