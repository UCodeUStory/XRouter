// 由 Hvigor 插件自动生成，请勿手动修改
export class XRouterManager {
  private static instance: XRouterManager;
  private _routeMaps: Map<string, WrappedBuilder<[]>> = new Map();
  private _navPathStack: NavPathStack | undefined;
  private _routeConfig?: ((path: string) => Promise<void>) | undefined = undefined;

  public get routeConfig(): ((path: string) => Promise<void>) | // 私有静态实例
  undefined {
    return this._routeConfig;
  }

  public get navPathStack(): NavPathStack | undefined {
    return this._navPathStack;
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

  public register(name: string, builder: WrappedBuilder<[]>) {
    this._routeMaps.set(name, builder);
  }

  bindNavPathStack(navPathStack: NavPathStack) {
    this._navPathStack = navPathStack;
  }

  bindRouteConfig(routeConfig: (path: string) => Promise<void>){
    this._routeConfig  = routeConfig;
  }

  get(name: string): WrappedBuilder<[]> | undefined {
    return this._routeMaps.get(name);
  }


}