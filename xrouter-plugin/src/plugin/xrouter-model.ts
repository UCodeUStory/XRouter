export class SearchContext {
  readonly projectRootDir: string;

  readonly entryDir: string;
  //文件缓存
  fileCaches: Map<string, string>;
  //路由缓存
  routeModelCaches: Array<RouteModel>;
  //文件缓存
  currentScanFiles: Map<string, string> = new Map();
  //新增路由缓存
  currentScanNewRouteModels: Array<RouteModel> = new Array();
  //输出路径
  genDir: string = 'src/main/ets/gen'

  allRouteModels(): Array<RouteModel> {
    const m = [...this.routeModelCaches, ...this.currentScanNewRouteModels];
    // console.log("merge",m)
    return m;
  }

  constructor(projectRootDir: string, entryDir: string) {
    this.projectRootDir = projectRootDir;
    this.entryDir = entryDir;
  }
}

export class XModule {
  name: string;
  dir: string;
}

export class RouteModel {
  // 所属组名
  group: string
  // 所属模块名
  moduleName: string
  // 模块版本
  version: string
  // 磁盘文件路径
  filePath: string
  // 路由组名
  host: string
  // 路由路径
  path: string
  // 页面名
  pageName: string
  // src 开头路径
  srcPath: string
  //TODO 分析出Page 参数
  prop: string
  // 文件hash
  fileHash: string
  // 页面参数
  paramName: string

  constructor() {
  }
}