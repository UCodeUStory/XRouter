export class SearchContext {
  //默认主机
  readonly DEFAULT_HOST = 'native'
  //route 代码生成目录
  static readonly GEN_DIR = 'src/main/ets/gen'
  //缓存文件
  readonly CACHE_FILE = 'xrouter_cache.json'
  //route缓存
  readonly MODEL_CACHE_FILE = 'xrouter_model_cache.json'

  projectRootDir: string;

  entryDir: string;
  //文件缓存
  fileCaches: Map<string, string>;
  //路由缓存
  routeModelCaches: Array<RouteModel>;
  //文件缓存
  currentScanFiles: Map<string, string> = new Map();
  //新增路由缓存
  currentScanNewRouteModels: Array<RouteModel> = new Array();

  allRouteModels(): Array<RouteModel> {
    const m = [...this.routeModelCaches, ...this.currentScanNewRouteModels];
    // console.log("merge",m)
    return m;
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
  //  文件hash
  fileHash: string

  constructor() {
  }
}