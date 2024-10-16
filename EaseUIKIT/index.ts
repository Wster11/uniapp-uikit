import AppUserStore from "./store/appUser";
import BlockStore from "./store/block";
import ChatStore from "./store/chat";
import ConnStore from "./store/conn";
import ContactStore from "./store/contact";
import ConversationStore from "./store/conversation";
import GroupStore from "./store/group";
import MessageStore from "./store/message";
import { EasemobChat } from "easemob-websdk";

class EaseUIKIT {
  public connStore: ConnStore;
  public chatStore: ChatStore;
  public appUserStore: AppUserStore;
  public convStore: ConversationStore;
  public blockStore: BlockStore;
  public contactStore: ContactStore;
  public groupStore: GroupStore;
  public messageStore: MessageStore;

  constructor() {
    this.connStore = new ConnStore();
  }
  // 初始化IM SDK
  public init(config: EasemobChat.ConnectionParameters) {
    if (this.connStore.conn) {
      return;
    }
    this.connStore.initChatSDK(config);
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
