import Vue from 'vue'
import App from './App.vue'

module.exports = function () {
    const app = new Vue({
        render: h => h(App)
    })
    return app
}