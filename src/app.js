import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'
export default function () {
    const router = createRouter()
    const app = new Vue({
        router,
        render: h => h(App)
    })
    
    return {
        router,
        app
    }
}