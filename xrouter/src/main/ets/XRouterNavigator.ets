import { XRouterManager } from "./XRouterManager";

export class XRouterNavigator {
  static push(path: string) {
    const routeConfig = XRouterManager.getInstance().routeConfig;
    if (routeConfig) {
      routeConfig!(path).then(() => {
        XRouterManager.getInstance().navPathStack?.pushPathByName(path, new Object())
      })
    }

  }

  static pop(){
    XRouterManager.getInstance().navPathStack?.pop()
  }
}