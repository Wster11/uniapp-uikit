import type { Chat } from "../types/index";

/**
 * IM连接管理类
 * 负责管理和存储IM连接实例
 */
class ConnStore {
  /** 
   * IM连接实例
   * 用于存储Chat SDK的连接对象
   */
  conn: Chat.Connection | null = null;

  /**
   * 构造函数
   * 初始化连接存储
   */
  constructor() {
    console.log("[ConnStore] Initializing...");
  }

  /**
   * 设置IM连接实例
   * @param connection Chat SDK的连接实例
   */
  setChatConn(connection: Chat.Connection) {
    console.log("[ConnStore] Setting chat connection");
    this.conn = connection;
  }

  /**
   * 获取IM连接实例
   * @returns Chat SDK的连接实例
   * @throws 如果连接未初始化则抛出错误
   */
  getChatConn(): Chat.Connection {
    if (this.conn) {
      return this.conn;
    }
    console.error("[ConnStore] Connection not initialized");
    throw new Error("conn is not initialized");
  }
}

export default ConnStore;
