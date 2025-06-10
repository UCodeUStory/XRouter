export class SearchContext {
  projectRootDir: string;
  entryDir:string;
  cacheFileMaps: Map<string, string>;
  modelCacheFileArray: Array<RouteModel>;
  scanFileMaps: Map<string, string> = new Map();
  scanRouteModelResult: Array<RouteModel> = new Array();
}

export  class XModule {
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