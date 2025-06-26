import { XRouterLogger } from "./XRouterLogger";
import { XRouterStack } from "./XRouterStack";

export interface PushOption {
  param?: Object;
  animated?: boolean;
  onPopResult?: (data: Object) => void
  // 监听push页面的关闭回调
  onClose?: () => void
}

export interface PopOption {
  result?: Object;
  animated?: boolean;
}

export class PageRecordExtra {
  onPopResult?: (data: Object) => void
  onClose?: () => void
}

export class PageRecord {
  url: string
  extra?: PageRecordExtra

  constructor(url: string, extra?: PageRecordExtra) {
    this.url = url;
    this.extra = extra
  }
}

export class XRouterManager {
  private static instance: XRouterManager;
  private _routeMaps: Map<string, WrappedBuilder<Object[]>> = new Map();
  private _navPathStack: NavPathStack | undefined;
  private _stack = new XRouterStack<PageRecord>();

  public get navPathStack(): NavPathStack | undefined {
    return this._navPathStack;
  }

  private _routeConfig?: ((path: string) => Promise<void>) | undefined = undefined;

  private constructor() {
    XRouterLogger.log('XRouterManager 实例已创建');
    this._stack.push(new PageRecord("root://home/page"))
  }

  public checkRouterPath(path: string, callBack: () => void) {
    if (this._routeMaps.has(path)) {
      callBack()
    } else {
      console.error("XRouter 跳转路由不存在：", path)
    }
  }

  private navigationInterception: NavigationInterception = {
    willShow: (from: NavDestinationContext | "navBar", to: NavDestinationContext | "navBar",
      operation: NavigationOperation, animated: boolean) => {
      if (typeof to === "string") {
        XRouterLogger.log(" navigation home page.");
      }
      let f: NavDestinationContext = from as NavDestinationContext;
      let target: NavDestinationContext = to as NavDestinationContext;

      switch (operation) {
        case NavigationOperation.PUSH:
          XRouterLogger.log('PUSH 操作')
          break;
        case NavigationOperation.POP:
          XRouterLogger.log('POP 操作')
          if (this.getCurrentPageRecord()?.url === f.pathInfo.name) {
            const record = this.popPageRecord()
            record.extra?.onClose?.()
          }
          break;
        case NavigationOperation.REPLACE:
          XRouterLogger.log('REPLACE 操作')
          break;
      }

    }
  }

  pushPageRecord(record: PageRecord) {
    XRouterLogger.log('入栈页面：' + record.url)
    this._stack.push(record)
  }

  popPageRecord(): PageRecord {
    const record = this._stack.peek();
    XRouterLogger.log('出栈页面：' + record?.url)
    return this._stack.pop()!
  }

  getCurrentPageRecord(): PageRecord | undefined {
    return this._stack.peek()
  }

  getAllPageRecord(): Array<PageRecord> {
    return this._stack.data
  }


  getHomePageRecord(): PageRecord | undefined {
    return this._stack.peekFirst()
  }

  public static getInstance(): XRouterManager {
    if (!XRouterManager.instance) {
      XRouterManager.instance = new XRouterManager();
    }
    return XRouterManager.instance;
  }

  public get routeConfig(): ((path: string) => Promise<void>) | undefined {
    return this._routeConfig;
  }

  public register(name: string, builder: WrappedBuilder<Object[]>) {
    this._routeMaps.set(name, builder);
  }

  public bindNavPathStack(navPathStack: NavPathStack) {
    this._navPathStack = navPathStack;
    this._navPathStack.setInterception(this.navigationInterception)
    return this;
  }

  public bindRouteConfig(routeConfig: (path: string) => Promise<void>) {
    this._routeConfig = routeConfig;
    return this;
  }

  public get(name: string): WrappedBuilder<Object[]> | undefined {
    return this._routeMaps.get(name);
  }
}