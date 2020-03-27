# 手牵手教你微信 js-sdk 本地调试

## 前言

> 本文主要是分享一下日常开发`微信 H5` 时的移动端调试方法及使用`微信 js-sdk`的一些经验 ，希望对各位有所帮助。

## 移动端调试

- **开发准备**

  - [微信开发者工具 1.x 版](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)
  - 内网穿透工具
    - [natapp](https://natapp.cn/)
    - [uTools](https://u.tools/)(个人常用)
  - 二维码生成
    - [草料二维码](https://cli.im/)(个人常用)
    - [uTools](https://u.tools/)

- **开发调试流**

  - **基础**

    > 整体页面布局，基本逻辑功能建议先在`chrome`或`微信开发者工具`调试完成再进入下一步真机调试，常用以下几个方法

    1. 手机和电脑处于同一局域网内，比如连着同一个 wifi、电脑开热点给手机、手机开热点给电脑等；然后在手机微信里直接访问项目运行时的 ip 地址(如`http://192.168.0.127:8080/`)即可进入页面，建议生成二维码扫一扫进去，此时电脑端修改的项目也会同步热更新到移动端
       > 优点：操作简单
       > 缺点：只能看看样式，测测按钮啥的，页面结构、日志输出之类的啥也看不到
    2. 使用 `chrome` 的 `inspect`功能，大致流程就是用数据线连接手机和电脑，手机授予电脑访问权限（`android`设备和`ios`设备授权操作不同），然后在`chrome`里访问`chrome://inspect/#devices`打开`inspect`主界面，此时在手机端访问页面就会被`chrome`监测到，我们勾选需要调试的页面并点击左下角的`inspect`就可以打开调试窗口啦。
       要注意一点的是`inspect`时需要科学上网一次，不然调试窗口无法加载内容。
       > 优点：电脑端调试窗口映射移动端页面操作，直观
       > 缺点：调试`ios`设备比较麻烦；本人使用过程中出现调试窗口花屏卡死问题
    3. 使用[微信开发者工具 0.7 版](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Web_Developer_Tools.html#5)，`android`设备支持`weinre`远程调试和`X5 Blink`内核调试(部分设备支持)，若使用`X5 Blink`内核调试，`inspect`页面时同样需要科学上网一次；`ios`设备仅支持`weinre`远程调试。[官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Web_Developer_Tools.html#3)有很详细的介绍，这边就不再赘述了
       > 优点：电脑端支持调试``微信 js-sdk`，集成`chrome`的`DevTools`，支持`weinre`远程调试 缺点：`X5 Blink`内核调试很多设备不支持了；远程调试时手机和电脑需连接同一`wifi`，手机设置代理

  - **进阶**

    > 以上三种方案基本能应付日常开发调试需求，但想要在手机调试`微信js-sdk`时就稍显头疼了，因为微信公众号不支持`localhost`及`ip`地址调试，曾经试过打包部署后再调试，但调试成本太高了，还需要后台小哥支持，所以接下来就说说我是如何进行本地调试吧

    - **思路**：[公众号测试号](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)+本地`node`服务+内网穿透本地运行项目+请求代理 + [vconsole](https://www.npmjs.com/package/vconsole)

    - **实操**

      1. **对本地运行项目进行内网穿透**  
         电脑运行项目，确定运行端口号，如`8080`，以`uTools`内网穿透插件为例，配置好穿透端口号和外网地址，点击右下角连接，成功后就可以通过外网地址访问啦，同时还是支持热更新（工程项目可能会遇到`Invalid Host header`问题，解决方法详见实操 4）

      ![](https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/utools%E5%86%85%E7%BD%91%E7%A9%BF%E9%80%8F%E9%85%8D%E7%BD%AE.png)

      2. **添加手机端调试窗口**  
         完成步骤 1 就通过外网访问本地项目了，但好像和通过`ip`地址打开没啥区别。。。别急，该`vconsole`登场了，本文`demo`以`vue`项目为例，先`npm`安装一下，在项目里引入并初始化，此时是不是看到页面右小角多了个绿色小按钮，没错，点它就对了。调试界面如下图，功能还是挺齐全的，可以愉快的~~调戏~~调试啦

         ```js
         // main.js
         if (process.env.NODE_ENV !== 'production') {
           const VConsole = require('vconsole')
           new VConsole()
         }
         ```

         ![](https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/vConsole.png)

      3. **本地`node`服务**  
         启动一个本地 node 服务，作用有两个

         1. 用于配置测试公众号时校验`url`是否能正确响应 Token 验证，详见[文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html)，下面代码示例

         ```js
         // sign.js
         const checkout = obj => {
           const { signature, timestamp, nonce } = obj
           // 公众号里配置的token
           const token = config.token
           // 字典排序拼接后进行sha1加密，再与signature比对
           const string = sort(nonce, timestamp, token),
             sha1 = require('js-sha1')
           return signature === sha1(string)
         }

         // router
         router.get('/checkout', async (ctx, next) => {
           const { echostr, timestamp, nonce, signature } = ctx.query
           // 不想校验来源的话可以直接ctx.body = echostr

           // 校验来源
           const res = util.checkout({ timestamp, nonce, signature })
           // 签证正确时返回echostr
           ctx.body = res ? echostr : false
           await next()
         })
         ```

         2. 用于生成`微信js-sdk`[签名](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)，首先获取[access_token](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)，再用`access_token`去获取`jsapi_ticket`，根据签名算法生成签名返回给前端，`access_token`和`jsapi_ticket`都需要缓存到本地，有效期 7200 秒，下面是签名代码示例

         ```js
           // 签名算法
           const sign = (jsapi_ticket, url) => {
           const ret = {
               jsapi_ticket,
               url,  // 当前url，不要转义!不要转义！不要转义！
               nonceStr: createNonceStr(), // 随机字符串
               timestamp: createTimestamp()  // 时间戳
             };
             // 字典排序后以url键值对形式拼接
             const string = raw(ret),
               sha1 = require("js-sha1");

             ret.signature = sha1(string);//sha1加密生成signature
           ret.appId = config.appId; // 公众号appId也由后端返回
             eturn ret;
           };
         ```

      4. **前端请求代理**  
          内网穿透后，使用外网地址访问页面时，若页面内请求的还是真实服务地址的话会产生跨域问题，而且还不能直接请求本地 node 服务地址，所以此时需要进行请求代理。
         首先把项目内的请求地址改成穿透地址，然后进行代理转发。`webpack`工程可以通过配置[devServer](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)实现，其他可以使用`nginx`，本文以`vue cli`工程配置`devServer`为例

         ```js
         // vue.config.js
         module.exports = {
           devServer: {
             disableHostCheck: true, // 绕过主机检查，解决Invalid Host header问题
             proxy: {
               '/getSignature|checkout': {
                 // checkout 用于公众号校验服务器有效性

                 // 本地项目获取签名的api名称不为getSignature时，可以重写
                 // pathRewrite: { "^/api": '/getSignature' }

                 target: 'http://127.0.0.1:3000' // 代理到本地noe服务地址
               },
               '^/other': {
                 // 其他接口也可以代理
                 target: 'http://xxx.xxx.x.x:80',
                 changeOrigin: true // 改变请求host，可选
               }
             }
           }
         }
         ```

    - **小结**

      以上就是本人调试`微信js-sdk`时的方法了，希望对各位有所帮助。

      > ps: 这里再提醒一点，通过内网穿透地址第一次访问 vue 项目时可能会出现长时间白屏的情况，这是由于本地调试时开启了 `source map` ，且代码包都没经过压缩，导致代码包体积较大，加载时堵塞了页面渲染，这时可以选择使用`cheap-module-eval-source-map`模式或直接关闭

      ![](https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/source-map.png)

      ![](https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/cheap-module-eval-source-map.png)

## 微信 js-sdk 使用分享

> 开发微信 H5 页面时会遇到许多与微信交互的场景，所以熟悉使用`微信js-sdk`能大大~~减少加班时间~~提升开发效率；接下来聊聊日常开发`微信js-sdk`中常遇到的问题，如果没使用过的小伙伴可以先看看[官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)

- `invalid signature`签名错误问题
  出现频次最高的错误，当确认变量名拼写、签名算法没问题的前提下，可以从`url`角度去入手排查
  1.  获取`url`只要`hash`前面的部分
      ```js
      const url = location.href.split('#')[0]
      // http://example.com/#login?age=99 -> http://example.com/
      ```
  2.  路由模式差异
      以`vue`路由为例，在`hash`模式下，无论路由如何变化，截取的`url`都不会变；但在`history`模式下，不同页面截取的`url`是不同的，所以当页面切换时得动态获取当前`url`去签名，此处还要区分平台差异，看下一条
  3.  平台差异(`history`模式下)
      - `android`平台，不同页面动态获取当前路由页面的`url`去签名都可以成功
      - `ios`平台，不同页面都需要使用**第一次进入页面**时的`url`去签名才可以成功
  4.  `encode`问题
      文档里要求签名`url`使用`encodeURIComponent`，否则会影响页面分享，然后这里需要注意的就是服务端拿到`url`后一定要`decodeURIComponent`后执行签名算法，不然`config`也会失败
      ```js
      // encodeURIComponent前
      'http://example.com/'
      // encodeURIComponent后
      'http%3A%2F%2example.com%2F'
      // 以下转义也会失败
      'http:\/\/example.com\/'
      ```
- `require subscribe`错误
  一般本地调试时才会遇到。扫码订阅[公众平台测试号](http://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index)就可以解决
- `invalid url domain`错误
  一般是`js`接口安全域名没有正确配置导致，注意去掉协议和端口号，然后检查拼写

- 接口常见问题

  - **`wx.ready`和`wx.error`**

    调用`wx.config`后，一般通过这两接口判断`config`是否成功，但注意以下几点

    - 进入`error`回调表示`config`一定失败了

    - 进入`ready`回调`config`不一定成功（黑人问号脸），因为会遇到以下两种情况：

      1. 执行`error`回调后也还是会执行`ready`回调，但`error`回调会比`ready`回调优先执行

      <img src="https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/error.png" style="zoom:80%;" />

      2. 只执行了`ready`回调，但调用接口时还是会出现`the permission value is offline verifying`情况，此时一般都是因为`config`异常了（找不到图了），请重新执行`wx.config`

    <img src="https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/ready.png" style="zoom: 80%;" />

    > 针对以上问题，可以使用 Promise 封装一下`config`方法

    ```js
    // 代码示例，详见本文demo
    jsSdk.config({
      debug: false,
      appId,
      timestamp,
      nonceStr,
      signature,
      jsApiList
    })
    return new Promise((resolve, reject) => {
      // ready不一定config成功...
      jsSdk.ready(() => {
        console.log('ready')
        resolve(jsSdk)
      })
      // 有error 的话会比ready先执行
      jsSdk.error(err => {
        console.log('err')
        reject(err)
      })
    })
    ```

  - **分享接口**  
    首先明确一点，H5 页面是无法通过该类接口主动调起微信菜单里的分享菜单的， 降级处理一般就是弹窗提示进行引导分享，但存在封号风险，谨慎使用！

    - `wx.onMenuShareTimeline`、`wx.onMenuShareAppMessage` 可以获取到用户是否点了微信菜单里的分享按钮，但无法判断是否真正分享了出去，比如弹出分享窗口后点击“否”返回页面，也算入`success`回调里。这两接口**即将废弃**，即将到何时是个未知数，所以还是尽量别用
    - `wx.updateAppMessageShareData`、`wx.updateTimelineShareData` 这两兄弟就是为了取缔上面两兄弟的，砍到了**按钮点击状态**获取功能，这么好的产品经理哪里找...

  - **图像接口**

    - `wx.chooseImage`返回的本地照片`localId`，类似于使用`URL.createObjectURL`创建的文件引用，`android`客户端可以直接当 `img`标签的`src`正常使用，但`ios`端不行，得使用`wx.getLocalImageData`转为`base64`格式再进行展示
    - `wx.uploadImage`会将你得图片上传到微信服务器保存 3 天（大厂财大气粗），并返回对应得服务器 ID，有效期内使用`wx.downloadImage`即可获取到该图片得`localId`

  - **待补充...**

## 调试 DEMO

光看不练假把式，为了让小伙伴们更容易理解文中内容，我用`vue cli`整了个`demo`给大家，从`github`下载下来就可以用了，整体项目结构如下图，项目地址[vue-js-sdk-demo](https://github.com/candyman0753/wx-js-sdk-demo)

![](https://github.com/candyman0753/wx-js-sdk-demo/blob/master/static/%E9%A1%B9%E7%9B%AE%E7%BB%93%E6%9E%84.png)

```
// 初始化项目
npm install

// 同时启动vue项目和node服务
npm run start

// 单独启动vue项目
npm run dev

// 单独启动node项目
npm run service
```

## 后话

> 虽然平时有做开发笔记，但整理成文章分享还是第一次，文章排版和语言组织也是勉强能看，若文中有错误的地方请各位大佬及时指出，我会第一时间修改。
