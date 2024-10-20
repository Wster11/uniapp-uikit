import AppUserStore from "./store/appUser";
import BlockStore from "./store/block";
import ChatStore from "./store/chat";
import ConnStore from "./store/conn";
import ContactStore from "./store/contact";
import ConversationStore from "./store/conversation";
import GroupStore from "./store/group";
import MessageStore from "./store/message";
import ConfigStore from "./store/config";
import { EaseUIKITConfig } from "./configType";
class EaseUIKIT {
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
  public init(config: EaseUIKITConfig) {
    if (this.connStore.conn) {
      return;
    }
    this.configStore.initConfig(config);
    this.connStore.initChatSDK(config.sdk, config.sdkConfig);
    this.blockStore = new BlockStore();
    this.chatStore = new ChatStore();
    this.contactStore = new ContactStore();
    this.convStore = new ConversationStore();
    this.appUserStore = new AppUserStore();
    this.groupStore = new GroupStore();
    this.messageStore = new MessageStore();
  }

  // 获取IM连接实例
  public getChatConn() {
    return this.connStore.getChatConn();
  }
}

const EaseConnKit = new EaseUIKIT();

export { EaseConnKit };

export type { EaseUIKIT };
