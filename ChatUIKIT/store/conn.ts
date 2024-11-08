import type { Chat } from "../types/index";

class ConnStore {
  /** IM连接实例 */
  conn: Chat.Connection | null = null;
  constructor() {}

  /** 设置conn实例 */
  setChatConn(connection: Chat.Connection) {
    this.conn = connection;
  }

  /** 获取conn实例 */
  getChatConn(): Chat.Connection {
    if (this.conn) {
      return this.conn;
    }
    throw new Error("conn is not initialized");
  }
}

export default ConnStore;
