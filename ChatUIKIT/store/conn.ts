import type { ChatSDK, ChatSDKStatic } from "../types/index";

class ConnStore {
  /** IM连接实例 */
  conn: ChatSDK.Connection | null = null;
  sdk: ChatSDKStatic | null = null;
  constructor() {}

  /** 初始化webIM */
  initChatSDK(sdk: ChatSDKStatic, config: ChatSDK.ConnectionParameters) {
    this.sdk = sdk;
    this.setChatConn(new sdk.connection(config));
    return this.conn;
  }

  /** 设置conn实例 */
  setChatConn(connection: ChatSDK.Connection) {
    this.conn = connection;
  }

  /** 获取conn实例 */
  getChatConn(): ChatSDK.Connection {
    if (this.conn) {
      return this.conn;
    }
    throw new Error("conn is not initialized");
  }

  /** 获取 websdk */
  getChatSDK(): ChatSDKStatic {
    if (this.sdk) {
      return this.sdk;
    }
    throw new Error("SDK is not found");
  }
}

export default ConnStore;
