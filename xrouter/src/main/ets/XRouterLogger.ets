export class XRouterLogger {
  static isDebug: boolean = false

  static log(message: string) {
    if (XRouterLogger.isDebug) {
      console.log("[xrouter]:"+message)
    }
  }
}