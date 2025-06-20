export class XRouterManager {
  private static instance: XRouterManager;
  private _routeMaps: Map<string, WrappedBuilder<Object[]>> = new Map();
  private _navPathStack: NavPathStack | undefined;
  private _routeConfig?: ((path: string) => Promise<void>) | undefined = undefined;

  private constructor() {
    console.log('XRouterManager 实例已创建');
  }

  private checkRouterPath(path: string, callBack: () => void) {
    if (this._routeMaps.has(path)) {
      callBack()
    } else {
      console.error("XRouter 跳转路由不存在：", path)
    }
  }

  private navigationInterception: NavigationInterception = {
    willShow: (from: NavDestinationContext | "navBar", to: NavDestinationContext | "navBar",
      operation: NavigationOperation, animated: boolean) => {

    }

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

  public push(path: string, params: Object | undefined,animated?:boolean) {
    this.checkRouterPath(path, () => {
      this._navPathStack?.pushPathByName(path, params,animated)
    })
  }

  public pop(animated?: boolean) {
    this._navPathStack?.pop()
  }

  public popToRoot(animated?: boolean) {
    this._navPathStack?.popToIndex(-1, animated);
  }

  public replace(path: string, params: Object | undefined, animated?: boolean) {
    this.checkRouterPath(path, () => {
      this._navPathStack?.replacePathByName(path, params, animated);
    })
  }

}