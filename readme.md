## 服务端渲染的基本概念
### 客户端渲染
### 服务端渲染
## 需要解决的问题

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