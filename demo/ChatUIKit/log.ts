/**
 * 日志工具类
 * 用于统一管理和输出调试信息
 */
class Logger {
  private static instance: Logger;
  private debugMode: boolean = false;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 启用调试模式
   */
  public enableDebug(): void {
    this.debugMode = true;
  }

  /**
   * 禁用调试模式
   */
  public disableDebug(): void {
    this.debugMode = false;
  }

  /**
   * 输出普通日志
   * @param message 日志信息
   * @param args 额外参数
   */
  public log(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[ChatUIKit] ${message}`, ...args);
    }
  }

  /**
   * 输出警告日志
   * @param message 警告信息
   * @param args 额外参数
   */
  public warn(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.warn(`[ChatUIKit] ${message}`, ...args);
    }
  }

  /**
   * 输出错误日志
   * @param message 错误信息
   * @param args 额外参数
   */
  public error(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.error(`[ChatUIKit] ${message}`, ...args);
    }
  }

  /**
   * 输出信息日志
   * @param message 信息
   * @param args 额外参数
   */
  public info(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.info(`[ChatUIKit] ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance();
