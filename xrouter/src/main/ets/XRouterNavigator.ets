import { XRouterManager } from "./XRouterManager";

export class XRouterNavigator {
  static push(path: string, params?: Object, animated?: boolean) {
    const routeConfig = XRouterManager.getInstance().routeConfig;
    if (routeConfig) {
      routeConfig!(path).then(() => {
        XRouterManager.getInstance().push(path, params, animated)
      })
    }
  }

  static pop(animated?: boolean) {
    XRouterManager.getInstance().pop(animated)
  }

  static popToRoot(animated?: boolean){
    XRouterManager.getInstance().popToRoot(animated)
  }

  static replace(path: string, params?: Object, animated?: boolean){
    XRouterManager.getInstance().replace(path, params, animated)
  }

}