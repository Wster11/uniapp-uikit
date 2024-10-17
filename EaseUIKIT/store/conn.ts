import { makeAutoObservable } from "mobx";
import type {
  EasemobChat,
  EasemobChatStatic
} from "easemob-websdk/Easemob-chat";

class ConnStore {
  /** IM连接实例 */
  conn: EasemobChat.Connection | null = null;
  sdk: EasemobChatStatic | null = null;
  constructor() {
    makeAutoObservable(this);
  }

  /** 初始化webIM */
  initChatSDK(
    sdk: EasemobChatStatic,
    config: EasemobChat.ConnectionParameters
  ) {
    this.sdk = sdk;
    this.setChatConn(new sdk.connection(config));
    return this.conn;
  }

  /** 设置conn实例 */
  setChatConn(connection: EasemobChat.Connection) {
    this.conn = connection;
  }

  /** 获取conn实例 */
  getChatConn(): EasemobChat.Connection {
    if (this.conn) {
      return this.conn;
    }
    throw new Error("conn is not initialized");
  }

  /** 获取 websdk */
  getChatSDK(): EasemobChatStatic {
    if (this.sdk) {
      return this.sdk;
    }
    throw new Error("SDK is not found");
  }
}

export default ConnStore;
