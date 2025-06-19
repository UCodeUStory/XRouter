export class XRouterManager {
  //只记录当前跳转页面参数
  private _pageParam?: Object | undefined;
  private static instance: XRouterManager;
  private _routeMaps: Map<string, WrappedBuilder<Object[]>> = new Map();
  private _navPathStack: NavPathStack | undefined;
  private _routeConfig?: ((path: string) => Promise<void>) | undefined = undefined;

  public getPageParam(): Object | undefined {
    return this._pageParam;
  }

  public get routeConfig(): ((path: string) => Promise<void>) | // 私有静态实例
  undefined {
    return this._routeConfig;
  }

  private constructor() {
    console.log('XRouterManager 实例已创建');
  }

  public static getInstance(): XRouterManager {
    if (!XRouterManager.instance) {
      XRouterManager.instance = new XRouterManager();
    }
    return XRouterManager.instance;
  }

  public register(name: string, builder: WrappedBuilder<Object[]>) {
    this._routeMaps.set(name, builder);
  }

  private navigationInterception: NavigationInterception = {
    willShow: (from: NavDestinationContext | "navBar", to: NavDestinationContext | "navBar",
      operation: NavigationOperation, animated: boolean) => {

    }

  }

  bindNavPathStack(navPathStack: NavPathStack) {
    this._navPathStack = navPathStack;
    this._navPathStack.setInterception(this.navigationInterception)
    return this;
  }

  bindRouteConfig(routeConfig: (path: string) => Promise<void>) {
    this._routeConfig = routeConfig;
    return this;
  }

  get(name: string): WrappedBuilder<Object[]> | undefined {
    return this._routeMaps.get(name);
  }

  push(path: string, params: Object | undefined, animated?: boolean) {
    this._navPathStack?.pushPathByName(path, params, animated)
  }

  pop(animated?: boolean) {
    this._navPathStack?.pop(animated)
  }

  popToRoot(animated?: boolean) {
    this._navPathStack?.popToIndex(-1, animated);
  }

  replace(path: string, params: Object | undefined, animated?: boolean) {
    this._navPathStack?.replacePathByName(path, params, animated);
  }
}