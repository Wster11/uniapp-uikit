import AppUserStore from "./store/appUser";
import BlockStore from "./store/block";
import ChatStore from "./store/chat";
import ConnStore from "./store/conn";
import ContactStore from "./store/contact";
import ConversationStore from "./store/conversation";
import GroupStore from "./store/group";
import MessageStore from "./store/message";
import ConfigStore from "./store/config";
import { ChatUIKITInitParams } from "./configType";
class ChatKIT {
  public connStore: ConnStore;
  public chatStore: ChatStore;
  public appUserStore: AppUserStore;
  public convStore: ConversationStore;
  public blockStore: BlockStore;
  public contactStore: ContactStore;
  public groupStore: GroupStore;
  public messageStore: MessageStore;
  public configStore: ConfigStore;
  constructor() {
    this.connStore = new ConnStore();
    this.configStore = new ConfigStore();
  }
  // 初始化IM SDK
  public init(config: ChatUIKITInitParams) {
    if (this.connStore.conn) {
      return;
    }
    this.configStore.setConfig(config.config);
    this.connStore.setChatConn(config.chat);
    this.blockStore = new BlockStore();
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
}

const ChatUIKIT = new ChatKIT();

export { ChatUIKIT };

export type { ChatKIT };
