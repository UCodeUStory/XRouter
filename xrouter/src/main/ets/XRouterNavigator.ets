import { PageRecord, PopOption, PushOption, XRouterManager } from "./XRouterManager";

export class XRouterNavigator {
  static onPopToRootResult?: (data: Object) => void

  private static getRealNavigator(): NavPathStack {
    if (!XRouterManager.getInstance().navPathStack) {
      throw Error('请先调用bindNavPathStack绑定路由')
    }
    return XRouterManager.getInstance().navPathStack!;
  }

  static push(url: string, option?: PushOption) {
    const navigator = XRouterNavigator.getRealNavigator();
    const routeConfig = XRouterManager.getInstance().routeConfig;
    if (routeConfig) {
      routeConfig!(url).then(() => {
        XRouterManager.getInstance().checkRouterPath(url, () => {
          XRouterManager.getInstance().pushPageRecord(new PageRecord(url, {
            onPopResult: option?.onPopResult,
            onClose: option?.onClose
          }))
          navigator.pushPathByName(url, option?.param, option?.animated)
        })
      })
    }
  }

  static pop(option?: PopOption) {
    const navigator = XRouterNavigator.getRealNavigator();
    if (option?.result) {
      const extra = XRouterManager.getInstance().getCurrentPageRecord()?.extra;
      extra?.onPopResult?.(option.result)
    }
    navigator.pop(option?.animated)
  }

  static popToRoot(option?: PopOption) {
    const navigator = XRouterNavigator.getRealNavigator();
    if (option?.result) {
      XRouterNavigator.onPopToRootResult?.(option.result)
    }
    navigator.popToIndex(-1, option?.animated);
  }

  static popUtil(url: string, option?: PopOption) {
    const navigator = XRouterNavigator.getRealNavigator();
    const records = XRouterManager.getInstance().getAllPageRecord();

    // 倒序查找目标页面位置
    let targetIndex = -1;
    const length = records.length - 1;
    for (let i = length; i >= 0; i--) {
      if (records[i].url === url) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      return;
    }
    // 迁移record 存储了push 回调
    const prevRecord = records[targetIndex + 1];

    for (let i = length; i > targetIndex; i--) {
      XRouterManager.getInstance().popPageRecord();
      navigator.pop(option?.animated);
    }
    if (option?.result) {
      prevRecord?.extra?.onPopResult?.(option.result);
    }
    prevRecord?.extra?.onClose?.();

  }


  static replace(url: string, param?: Object, animated?: boolean) {
    const routeConfig = XRouterManager.getInstance().routeConfig;
    if (routeConfig) {
      routeConfig!(url).then(() => {
        XRouterManager.getInstance().checkRouterPath(url, () => {
          const oldPageRecord = XRouterManager.getInstance().popPageRecord()
          XRouterManager.getInstance().pushPageRecord(new PageRecord(url, {
            onPopResult: oldPageRecord.extra?.onPopResult,
            onClose: oldPageRecord.extra?.onClose
          }))
          XRouterNavigator.getRealNavigator().replacePathByName(url, param, animated);
        })
      })
    }
  }
}