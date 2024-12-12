# Easemob UIKit Demo (Vue3)

<Toc />

环信单群聊 UIKit 是基于环信即时通讯云 IM SDK 开发的一款即时通讯 UI 组件库，提供各种组件实现会话列表、聊天界面、联系人列表及后续界面等功能，帮助开发者根据实际业务需求快速搭建包含 UI 界面的即时通讯应用。

## 支持平台（vue3）

- Android
- iOS
- 微信小程序
- H5

## 静态资源说明

UIKit中依赖的静态资源（`ChatUIKit/assets`）放置在环信服务器中,有访问频率限制，建议您将静态资源放置在您的业务服务器上，然后修改 `ChatUIKit/const/index.ts` 文件中的 `ASSETS_URL` 为您的资源服务器地址。

## 快速跑通DEMO

### 1.下载 `easemob-uikit-uniapp` 项目并安装依赖


下载源码到你当前的工作空间 ${workspace}

```bash
git clone https://github.com/easemob/easemob-uikit-uniapp.git
```

切换路径到 `${workspace}/easemob-uikit-uniapp/demo` 中，并安装项目依赖。

```bash
cd easemob-uikit-uniapp/demo && npm i
```

### 2. 通过 HBuilderX打开demo项目

通过 [HBuilderX](https://dcloud.io/hbuilderx.html) 打开项目中的 demo 文件夹, 即 `${workspace}/easemob-uikit-uniapp/demo`

### 3. 获取环信AppKey和服务连接地址

AppKey和服务器连接地址可在 [环信即时通讯云控制台](https://console.easemob.com/) 中获取。

在应用列表中获取AppKey

<img src="./image1.png" alt="appkey" width="500" />

点击管理进入`即时通讯/服务概览`，获取您的服务连接地址

<img src="./image2.png" alt="url" width="500" />


将获得的appKey和服务器连接地址，赋值给 `${workspace}/easemob-uikit-uniapp/demo/const/index.ts` 文件中的 `APPKEY`、 `API_URL` 和 `URL` 参数。

```javascript
const APPKEY = "";  // 环信appkey
const API_URL = "" // 环信 rest api地址 https协议
const URL = "" // 环信 websocket 地址 wss协议
```

### 第四步：使用 HBuilderX 运行 demo

打开 HBuilderX 工具栏 -> 运行, 选择指定运行平台, 例如浏览器, 然后点击运行

<img src="./image3.png" alt="run" width="300" />

## 相关链接

- [集成文档](https://docs-im-beta.easemob.com/document/web/quickstart.html);









