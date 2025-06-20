import { RouteModel, SearchContext } from "./xrouter-model";
import * as fs from 'fs';
import * as path from 'path';
import { AbstractXRouterHandler } from "./xrouter-handler";

const DEFAULT_HOST = 'native'
const GEN_DIR = 'src/main/ets/gen'
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};


export class GenerateRoutesHandler extends AbstractXRouterHandler {
  protected doHandle(searchContext: SearchContext): void {
    const generator = new XRouterGenerator(searchContext);
    generator.generate()
    this.process(searchContext)
  }
}

class XRouterGenerator {
  private searchContext: SearchContext;

  constructor(context: SearchContext) {
    this.searchContext = context
  }

  generate() {
    //清除无效的缓存代码
    this.clearGenerateFiles()
    //生成路由初始化代码
    this.generateNewRouteInitializeFiles()
    //检查一下历史路由文件
    this.generateCacheRouteInitializeFiles()
    //生成统一配置文件
    this.generateXRouterConfig()
  }

  clearGenerateFiles() {
    const xRouterGenDir = path.join(this.searchContext.entryDir, GEN_DIR)
    const scanFileHashSet = new Set();
    //所有扫描过的文件
    this.searchContext.currentScanFiles.forEach((value, key) => {
      scanFileHashSet.add(value)
    })

    // 过滤掉不存在的RouterModel缓存
    this.searchContext.routeModelCaches = this.searchContext.routeModelCaches.filter((m: any) => {
      if (!scanFileHashSet.has(m.fileHash)) {
        console.log('删除fileHash', m.fileHash);

        // 构造文件路径
        const xRouterInitializeFile = path.join(
          xRouterGenDir,
          `XRouter${(m.host ?? DEFAULT_HOST).capitalize()}${m.path.capitalize()}Initialize.ets`
        );

        // 删除物理文件
        if (fs.existsSync(xRouterInitializeFile)) {
          fs.unlinkSync(xRouterInitializeFile);
          console.log("文件已删除:", xRouterInitializeFile);
        }

        return false; // 从数组中移除
      }

      return true; // 保留该模型
    });

  }

  getRouteGenerateDir() {
    const xRouterGenDir = path.join(this.searchContext.entryDir, GEN_DIR)
    fs.mkdirSync(xRouterGenDir, { recursive: true });
    return xRouterGenDir;
  }

  generateRouteInitializeFiles(getRouteGenerateDir: string, entryName: string, routeModels: Array<RouteModel>) {
    for (let routeModel of routeModels) {
      const xRouterInitializeFile =
        path.join(getRouteGenerateDir,
          `XRouter${(routeModel.host ?? DEFAULT_HOST).capitalize()}${routeModel.path.capitalize()}Initialize.ets`)
      let packagePath = ''
      if (routeModel.group !== 'source') {
        if (routeModel.group === '') {
          //无组织去掉斜杠
          packagePath = `${routeModel.moduleName}/${routeModel.srcPath}`
        } else {
          packagePath = `${routeModel.group}/${routeModel.moduleName}/${routeModel.srcPath}`
        }
      } else {
        packagePath = `${routeModel.moduleName}/${routeModel.srcPath}`
        //当前entry 下 不能模块引用
        if (routeModel.moduleName === entryName) {
          packagePath = path.relative(GEN_DIR, routeModel.srcPath)
        }
      }

      let xRouterInitializeCode = `
import { XRouterManager } from "@ustory/xrouter"
import { ${routeModel.pageName} } from "${packagePath}"
`;
      const noParam = `
@Builder
function XRouterBuilder() {
  ${routeModel.pageName}()
}
`
      const withParam = `
@Builder
function XRouterBuilder(param:Object) {
  ${routeModel.pageName}({${routeModel.paramName}: param})
}
`
      if (routeModel.paramName) {
        xRouterInitializeCode += withParam
      } else {
        xRouterInitializeCode += noParam
      }

      const after = `
function init(){
  XRouterManager.getInstance().register('${routeModel.host ?? DEFAULT_HOST}://${routeModel.path}', wrapBuilder<Object[]>(XRouterBuilder))
}

init()`
      xRouterInitializeCode += after
      fs.writeFileSync(xRouterInitializeFile, xRouterInitializeCode, { encoding: 'utf8' });

    }
  }

  generateNewRouteInitializeFiles() {
    const startTime = Date.now();
    const generateDir = this.getRouteGenerateDir();
    const entryName = path.basename(this.searchContext.entryDir);
    this.generateRouteInitializeFiles(generateDir, entryName, this.searchContext.currentScanNewRouteModels)
    // console.log('generateNewRouteInitializeFiles耗时：' + (Date.now() - startTime) + '毫秒');
  }

  //因为有可能被意外删除，所以要判断文件是否存在，重新生成
  generateCacheRouteInitializeFiles() {
    const startTime = Date.now();
    const generateDir = this.getRouteGenerateDir();
    const entryName = path.basename(this.searchContext.entryDir);
    const loseRouteModel = []
    for (let routeModel of this.searchContext.routeModelCaches) {
      const xRouterInitializeFile =
        path.join(generateDir,
          `XRouter${(routeModel.host ?? DEFAULT_HOST).capitalize()}${routeModel.path.capitalize()}Initialize.ets`)
      if (!fs.existsSync(xRouterInitializeFile)) {
        loseRouteModel.push(routeModel)
      }
    }
    this.generateRouteInitializeFiles(generateDir, entryName, loseRouteModel)

    console.log('generateNewRouteInitializeFiles耗时：' + (Date.now() - startTime) + '毫秒');
  }

  generateXRouterConfig() {
    const startTime = Date.now();
    const xRouterGenDir = path.join(this.searchContext.entryDir, 'src/main/ets/gen')
    const xRouterConfigFile = path.join(xRouterGenDir, 'XRouterConfig.ets')
    const allRouteModels = this.searchContext.allRouteModels()
    let insertCodes = ''
    allRouteModels.forEach(routeModel => {
      const insertCode = `
      case '${routeModel.host ?? DEFAULT_HOST}://${routeModel.path}':
        await import('./XRouter${(routeModel.host ?? DEFAULT_HOST).capitalize()}${routeModel.path.capitalize()}Initialize')
        break;
    `
      insertCodes += insertCode
    })
    const xRouterConfigFileContent = `
//自动生成类
export class XRouterConfig {
  //动态导入
  static async initialize(path: string) {
    switch (path) {` + `${insertCodes}` + `
    }
  }
}
          `
    fs.writeFileSync(xRouterConfigFile, xRouterConfigFileContent, { encoding: 'utf8' });
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log('generateXRouterConfig耗时：' + totalTime + '毫秒');

  }
}