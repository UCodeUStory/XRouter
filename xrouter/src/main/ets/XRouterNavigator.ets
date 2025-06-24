import { PopOption, PushOption, XRouterManager } from "./XRouterManager";

export class XRouterNavigator {
  private static getRealNavigator(): NavPathStack {
    if (!XRouterManager.getInstance().navPathStack) {
      throw Error('请先调用bindNavPathStack绑定路由')
    }
    return XRouterManager.getInstance().navPathStack!;
  }

  static push(url: string, option?: PushOption) {
    const routeConfig = XRouterManager.getInstance().routeConfig;
    if (routeConfig) {
      routeConfig!(url).then(() => {
        XRouterManager.getInstance().checkRouterPath(url, () => {
          XRouterNavigator.getRealNavigator().pushPathByName(url, option?.param, (data) => {
            option?.onPopResult?.(data.result)
          }, option?.animated)
        })
      })
    }
  }

  static pop(option?: PopOption) {
    if (option?.result) {
      XRouterNavigator.getRealNavigator().pop(option.result, option.animated)
    } else {
      XRouterNavigator.getRealNavigator().pop(option?.animated)
    }
  }

  static popToRoot(option?: PopOption) {
    if (option?.result) {
      XRouterNavigator.getRealNavigator().popToIndex(-1, option.result, option.animated);
    } else {
      XRouterNavigator.getRealNavigator().popToIndex(-1, option?.animated);
    }
  }

  static replace(url: string, params?: Object, animated?: boolean) {
    XRouterManager.getInstance().checkRouterPath(url, () => {
      XRouterNavigator.getRealNavigator().replacePathByName(url, params, animated);
    })
  }
}