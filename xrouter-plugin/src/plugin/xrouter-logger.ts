export class Logger {
  private static instance: Logger;
  debugMode: boolean = false;

  // 私有构造函数，防止外部直接实例化
  private constructor() {
  }

  // 静态方法获取单例实例
  public static get(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // debug 日志方法
  public d(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log("[XRouter]", message, ...args);
    }
  }

  // info 日志方法
  public i(message: string, ...args: any[]): void {
    console.log("[XRouter]", message, ...args);
  }
}