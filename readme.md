## 服务端渲染的基本概念
### 客户端渲染

前端开发者做的最多的SPA页面就是典型的客户端渲染，当发送一个请求的时候，我们先得到一个简单的`html`结构，然后加载静态资源，这个过程中会导致首页白屏。当资源加载执行后，由客户端
创建页面元素显示出来，这就是客户端渲染
### 服务端渲染

服务端渲染其实在很久以前就有啦，比如典型的`php`输出页面的年代，页面整个的`html`内容都随请求一次性到达客户端，它具备良好的渲染速度和对`SEO`友好的支持。但是针对现在前端框架的服务端渲染，我们不仅仅是输出`html`,而是要发挥框架提供的各种功能，也就是今天要讲的`vue ssr`
## 需要解决的问题
想要实现直出`html`结构，并且保留框架的能力，我们需要解决下面几个问题：

1、把vue实例转化成html字符串的问题
2、输出到浏览器后要能够保留vue的能力，也就是交互
3、工程化的能力

## 目录结构

```
├── index.html
├── package.json
├── readme.md
├── server.js  #服务端运行脚本
├── src
|  ├── components
|  ├── router
|  |  └── index.js
|  └── views
|     └── Home.vue
|  ├── App.vue
|  ├── app.js
|  ├── client_entry.js
|  ├── server_entry.js

```

## 开始编码

### 基本案例

#### 先安装基本依赖

```bash
yarn add express vue vue-router vue-server-renderer -S
yarn add nodemon -D
```
`vue-server-renderer`这个依赖是官方提供的帮助我们处理服务端渲染的
`express`是本次实验的后端框架

#### 服务端代码 `server.js`

```js
const express = require('express')
const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()
const app = express()

app.get('*', async (req, res) => {
    const vm = new Vue({
        template: `<button @click="count++">{{count}}</button>`,
        data: {
            count: 1
        },
    })
    renderer.renderToStream(vm).pipe(res)
})

app.listen(3000)
```
在`package.json`中添加脚本运行服务端代码

```
 "start": "nodemon server.js"
```
此时页面上能显示一个光秃秃的按钮，但是点击没有任何效果。通过查看源代码发现就是很纯洁的源码，连标准的`html`都没有。

#### 写一个模板，让页面丰富一下

`createRenderer`可以传递一些配置参数，可以参考文档或者自己点进去看看如何配置

`server.js`
```js
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
```

`index.html`

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>

<body>
    <!--vue-ssr-outlet-->
</body>

</html>
```
细心的你会发现，我给`renderToStream`传递了第二个参数，并且在`html`里面渲染出来了，到这里已经体验了一把`ssr`渲染，但是啊但是，这玩意跟咋平时用`vue-cli`的项目开发差距甚大，没法玩转我们的单文件组件和路由等等,下面就开始改造吧~

### 工程化解决

要像平时开发项目一样来做的话，肯定少了不`webpack`打包等等一系列的依赖，在开始之前先安装一下依赖吧！

```bash
yarn add webpack webpack-cli vue-loader vue-template-compiler vue-style-loader css-loader babel-loader @babel/core @babel/preset-env webpack-merge -D
```
安装完依赖以后我们先在根目录下创建一个build文件夹用于存放我们的webpack构建配置文件，并且先创建好三个文件：
- build/base.config.js
- build/client.config.js
- build/server.config.js

前面基础部分很明显只是解决了服务端的部分问题，怎么保证后端输出后前端能交互以及代码复用和工程化构建都没有解决。先不慌编写打包构建的配置，先来分别给服务端和客户端编写入口文件，先来看一张图：
![ssr](https://cloud.githubusercontent.com/assets/499550/17607895/786a415a-5fee-11e6-9c11-45a2cfdf085c.png)

由于服务端进程常驻内存的特点，为了避免交叉请求状态污染，我们需要避免单例，所以通用代码`app.js` 如下：

```js
const Vue = require('vue')

module.exports = function () {
    const app = new Vue({
        data: {
            count: 1
        },
        template: `<div>
            <button @click="count++">{{count}}</button>
        </div>`,
    })
    return app
}
```

此时还没有用到`webpack`，现在直接用`commonjs`来编写代码，那么对应的`server.js`就变成下面这样:
```js
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
```

但是啊但是，现在还没用到webpack，这样我们没法还好发挥啊 ，肯定不符合前端仔的风格，对吧！下面我们来分别编写客户端和服务端的入口文件，顺便也改造成`esmodule`
App.vue
```vue
<template>
  <div id="app">
    <h1>this is app vue</h1>
    <button @click="count++">{{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 1,
    };
  },
};
</script>

<style>
</style>
```

app.js
```js
import Vue from 'vue'
import App from './App.vue'

export default function () {
    const app = new Vue({
        render: h => h(App)
    })
    return app
}
```
client_entry.js

```js
import createApp from './app.js'
createApp().$mount('#app')
```
server_entry.js
```js
import createApp from './app.js'

export default () => {
    const app = createApp()
    return app
}
```

编写完了，那么现在`server.js`没法直接用源码文件了，所以再编写打包配置来打包来丰富项目的能力，我们只有按需打包出`vue-server-renderer`需要的资源，才能使我们的服务端程序能够完成ssr和客户端的同构：

build/base.config.js
```js
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
    mode: 'development',
    output: {
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {
                        loader: 'css-loader',

                    }
                ]
            }
        ]

    },
    plugins: [
        new VueLoaderPlugin()
    ]
}
```
build/client.config.js
```js
const path = require('path')
const { merge } = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const base = require('./base.config.js')
module.exports = merge(base, {
    entry: {
        client: path.resolve(__dirname, '../src/client_entry.js')
    },
    plugins: [
        new VueSSRClientPlugin()
    ]
})
```
build/server.config.js
```js
const path = require('path')
const { merge } = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const base = require('./base.config.js')
module.exports = merge(base, {
    entry: {
        client: path.resolve(__dirname, '../src/server_entry.js')
    },
    target: 'node',
    output: {
        libraryTarget: 'commonjs2'
    },
    plugins: [
        new VueSSRServerPlugin()
    ]
})
```

接下来我们在`package.json`里增加几条命令：
```json
"scripts": {
    "start": "nodemon server.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "webpack --config build/client.config.js",
    "build:server": "webpack --config build/server.config.js"
}
```

执行构建后生成啦打包后的文件，此时我们再来修改我们的服务端代码
server.js
```js
const express = require('express')
const fs = require('fs')
const template = fs.readFileSync('./index.html', 'utf-8')
// const renderer = require('vue-server-renderer').createRenderer({
//     template
// })

const app = express()
app.use(express.static('dist')) //
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template,
    clientManifest,
})




app.get('*', async (req, res) => {
    // const createApp = require('./src/app.js')
    // renderer.renderToStream(createApp(), {
    //     title: 'hello vue ssr'
    // }).pipe(res)
    renderer.renderToString({
        title:'hello vue ssr'
    }, (err, html) => {
        // 处理异常……
        res.end(html)
    })
})

app.listen(3000)
```

重新执行`yarn build`和`yarn start`,运行后会发现控制台有报错，我的解决办法是：

1、`webpack`基本配置里面指定`publicPath`
2、`app.use(express.static('dist')) `

至此，一个基本的服务端渲染已经完成，并且页面能直出html,上面的按钮也可以点击啦！


### 解决路由的问题

到目前为止我还没有用到路由，先想一想，服务是由后台起的，然后路由`js`代码这里肯定不知道，肯定需要服务端来告诉传递给我们的应用代码吧！好的接下来我们先写一点基本的路由的代码，然后再来解决这个路由的问题

router/index.js

```js
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
```
对应的app.js修改为：

```js
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
```

服务端和客户端的入口文件也需要改一下解构出app和路由,特别是服务端入口需要修改成promise形式，因为可能存在异步组件

server_entry.js

```js
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
```

最后我们修改一下server.js，把请求的url地址传递到我们的应用代码里面来

```js
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
```

到这里，我们再次运行构建和运行启动命令，可以完美的享受路由带给我们的乐趣～～。

## 最后

最后，我想说的是路由这一块我们完全可以参照 `nuxt.js`动态处理，当然你也可以注入一些服务端执行的数据获取函数以及包括一些404的场景也需要考虑。还有这个项目还有没有完成的部分：代码分割、vuex等等！希望这篇文章能够给你在服务端渲染这一块有个比较好的理解。特别是那张图片一定要认真反复的看看哦，最后本项目代码仓库是：[ssr_demo](https://github.com/xiawei0725/ssr_demo),如果有任何问题或者是错误请评论区回复～～
