import * as fs from 'fs';
import * as path from 'path';
import { AbstractXRouterHandler } from './xrouter-handler';
import { SearchContext } from "./xrouter-model";

const CACHE_FILE = 'xrouter_cache.json'
const MODEL_CACHE_FILE = 'xrouter_model_cache.json'


export class ReadCacheHandler extends AbstractXRouterHandler {
  protected doHandle(searchContext: SearchContext): void {
    const routerCache = new XRouterCache(searchContext);
    routerCache.readCache()
    this.process(searchContext)
  }
}

export class WriteCacheHandler extends AbstractXRouterHandler {
  protected doHandle(searchContext: SearchContext): void {
    console.log('WriteCacheHandler')
    const routerCache = new XRouterCache(searchContext);
    routerCache.writeCacheFile()
    this.process(searchContext)
  }
}


class XRouterCache {
  private searchContext: SearchContext

  constructor(context: SearchContext) {
    this.searchContext = context
  }

  readCache() {
    //创建缓存文件夹
    this.initCacheDir()
    //读取缓存信息
    this.readCacheFile();
  }

  private readCacheFile() {
    const startTime = Date.now();
    const cacheDir = this.getCacheDir(this.searchContext.projectRootDir);
    try {
      const cacheFile = path.join(cacheDir, CACHE_FILE);
      const fileContent = fs.readFileSync(cacheFile, 'utf8');
      const fileCaches = new Map<string, string>(Object.entries(JSON.parse(fileContent)));
      this.searchContext.fileCaches = fileCaches
    } catch (e) {
      this.searchContext.fileCaches = new Map();
    }

    try {
      const routeModelCacheFile = path.join(cacheDir, MODEL_CACHE_FILE)
      const routeModelCachesStringContent = fs.readFileSync(routeModelCacheFile, 'utf8');
      const routeModelCaches = JSON.parse(routeModelCachesStringContent);
      this.searchContext.routeModelCaches = routeModelCaches
    } catch (e) {
      this.searchContext.routeModelCaches = []
      console.log('readCacheFile read failed')
    }

    console.log('readCacheFile耗时：' + (Date.now() - startTime) + '毫秒')
  }

  writeCacheFile() {
    const startTime = Date.now();

    const cacheDir = this.getCacheDir(this.searchContext.projectRootDir);
    const cacheFile = path.join(cacheDir, CACHE_FILE);
    const mergeResult = this.searchContext.allRouteModels()
    this.checkDupRouter(mergeResult)

    // 写入文件（将 Map 转为可序列化的对象）
    const serializableMap = Object.fromEntries(this.searchContext.currentScanFiles);
    fs.writeFileSync(cacheFile, JSON.stringify(serializableMap), { encoding: 'utf8' });

    const modelCacheFile = path.join(cacheDir, MODEL_CACHE_FILE)

    fs.writeFileSync(modelCacheFile, JSON.stringify(mergeResult), { encoding: 'utf8' });

    console.log('写入缓存文件耗时：' + (Date.now() - startTime) + '毫秒')
  }

  private initCacheDir() {
    const cacheDir = path.join(this.searchContext.projectRootDir, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  }

  private getCacheDir(projectRootDir: string) {
    return path.join(projectRootDir, '.cache');
  }

  private checkDupRouter(mergeResult: Array<RouteModel>) {
    let isDup = false;
    const checkDupSet = new Set();
    mergeResult.forEach(model => {
      const router = model.host + "://" + model.path;
      if (checkDupSet.has(router)) {
        console.error('重复的路由为：' + router);
        isDup = true;
      } else {
        checkDupSet.add(router);
      }
    });
    if (isDup) {
      console.error('路由重复，生成路由失败,请检查！！！！');
      try {
        const cacheDir = this.getCacheDir(this.searchContext.projectRootDir)
        if (fs.existsSync(cacheDir)) {
          fs.rmdirSync(cacheDir,{ recursive: true });
        }
      } catch (e) {
        console.error('删除cache目录异常')
      }
      throw Error('路由重复，生成路由失败,请检查！！！！');
    }
  }
}