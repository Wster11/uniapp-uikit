import AppUserStore from "./store/appUser";
import ChatStore from "./store/chat";
import ConnStore from "./store/conn";
import ContactStore from "./store/contact";
import ConversationStore from "./store/conversation";
import GroupStore from "./store/group";
import MessageStore from "./store/message";
import ConfigStore from "./store/config";
import { ChatUIKitInitParams, FeatureConfig } from "./configType";
import { logger } from "./log";
class ChatKIT {
  public connStore: ConnStore;
  public chatStore: ChatStore;
  public appUserStore: AppUserStore;
  public convStore: ConversationStore;
  public contactStore: ContactStore;
  public groupStore: GroupStore;
  public messageStore: MessageStore;
  public configStore: ConfigStore;
  constructor() {
    this.connStore = new ConnStore();
    this.configStore = new ConfigStore();
  }
  // 初始化IM SDK
  public init(params: ChatUIKitInitParams) {
    if (this.connStore.conn) {
      return;
    }
    this.configStore.setThemeConfig(params.config.theme);
    this.connStore.setChatConn(params.chat);
    params.config.isDebug && logger.enableDebug();
    this.chatStore = new ChatStore();
    this.contactStore = new ContactStore();
    this.convStore = new ConversationStore();
    this.appUserStore = new AppUserStore();
    this.groupStore = new GroupStore();
    this.messageStore = new MessageStore();
  }

  /** 获取IM连接实例 */
  public getChatConn() {
    return this.connStore.getChatConn();
  }
  /** 获取UIKIT主题配置 */
  public getThemeConfig() {
    return this.configStore.getThemeConfig();
  }
  /** 获取UIKIT功能配置 */
  public getFeatureConfig() {
    return this.configStore.getFeatureConfig();
  }
  /** 隐藏UIKIT功能 */
  public hideFeature(features: Array<keyof FeatureConfig>) {
    this.configStore.hideFeature(features);
  }
  /** 在 onShow 生命周期检测IM链接是否有效*/
  public onShow() {
    // 如果IM是登录状态，则检测IM链接是否有效
    if (this.getChatConn().logout === false) {
      this.getChatConn().onShow();
    }
  }
}

const ChatUIKit = new ChatKIT();

export { ChatUIKit };

export type { ChatKIT };
