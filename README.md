# Easemob UIKit for Uniapp (Vue3)

<Toc />

环信单群聊 UIKit 是基于环信即时通讯云 IM SDK 开发的一款即时通讯 UI 组件库，提供各种组件实现会话列表、聊天界面、联系人列表及后续界面等功能，帮助开发者根据实际业务需求快速搭建包含 UI 界面的即时通讯应用。

## 支持平台（vue3）

- Android
- iOS
- 微信小程序
- H5

## UIKit 基本项目结构

```
└── ChatUIKit
    ├── assets                                 // UIKit 资源文件
    ├── components                             // UIKit 通用组件
    ├── const                                  // UIKit 常量
    ├── locales                                // UIKit 国际化
    ├── modules                                // UIKit 页面组件
    │   ├── Chat                                  // 聊天功能模块
    │   ├── ChatNew                               // 发起新会话模块
    │   ├── ContactAdd                            // 添加联系人模块
    │   ├── ContactList                           // 联系人列表模块      
    │   ├── ContactRequestList                    // 联系人好友请求列表模块
    │   ├── ContactSearchList                     // 联系人搜索列表模块
    │   ├── Conversation                          // 会话列表模块
    │   ├── ConversationSearchList                // 会话搜索列表模块
    │   ├── GroupCreate                           // 创建群组模块
    │   ├── GroupList                             // 群组列表模块
    │   ├── VideoPreview                          // 视频消息预览模块
    ├── store                                  // UIKit store
    │   ├── appUser.ts                            // UIKit用户属性store
    │   ├── chat.ts                               // IM连接状态和事件处理
    │   ├── config.ts                             // UIKit Config
    │   ├── conn.ts                               // 管理SDK实例
    │   ├── contact.ts                            // 联系人相关store
    │   ├── conversation.ts                       // 会话相关store
    │   ├── group.ts                              // 群组相关store
    │   ├── message.ts                            // 消息相关store
    ├── styles                                 // UIKit 通用样式
    ├── types                                  // UIKit 类型定义
    ├── utils                                  // UIKit 通用工具函数
    ├── configTypes.ts                         // UIKit 配置类型定义
    ├── index.ts                               // UIKit 入口文件
    ├── log.ts                                 // UIKit 日志类
    ├── sdk.ts                                 // UIKit IM SDK 类型
```

## 源码集成

请参考[集成文档](https://docs-im-beta.easemob.com/document/web/quickstart.html)

## 静态资源说明

UIKit中依赖的静态资源（`ChatUIKit/assets`）放置在环信服务器中,有访问频率限制，建议您将静态资源放置在您的业务服务器上，然后修改 `ChatUIKit/const/index.ts` 文件中的 `ASSETS_URL` 为您的资源服务器地址。

## 相关资源

- [快速开始](https://docs-im-beta.easemob.com/document/web/quickstart.html);
- [集成文档](https://docs-im-beta.easemob.com/document/web/quickstart.html);
