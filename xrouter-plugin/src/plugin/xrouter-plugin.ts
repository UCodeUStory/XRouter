import { HvigorNode, HvigorPlugin,HvigorTask,getNode } from '@ohos/hvigor';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import json5 from 'json5'
import { Project, SyntaxKind, ScriptTarget, StructureKind, ScriptKind } from "ts-morph";
import { RouteModel, XModule, SearchContext } from './xrouter-model'


export function XRouterPlugin(): HvigorPlugin {
    return {
        pluginId: 'XRouterPlugin',
        apply(node: HvigorNode) {
            node.registerTask({
                name: "XRouterTask",
                dependencies: ['default@PreBuild'],
                postDependencies: ['default@CreateBuildProfile'],
                run: (taskContext) => {
                    const startTime = Date.now();
                    // console.log('taskContext.modulePath', taskContext.modulePath)
                    const projectRootDir = path.dirname(taskContext.modulePath);
                    const entryDir = taskContext.modulePath;
                    const searchContext = new SearchContext();
                    searchContext.projectRootDir = projectRootDir
                    searchContext.entryDir = entryDir

                    //创建缓存文件夹
                    initCacheDir(projectRootDir)
                    //读取缓存信息
                    readCacheFile(searchContext);
                    //获取所有源码依赖modules
                    findXRouterModels(searchContext)
                    //清除无效的缓存代码
                    clearGenerateFiles(searchContext)
                    //生成路由初始化代码
                    generateNewRouteInitializeFiles(searchContext)
                    //检查一下历史路由文件
                    generateCacheRouteInitializeFiles(searchContext)
                    //生成统一配置文件
                    genXRouterConfig(searchContext)
                    //写入缓存文件
                    writeCacheFile(searchContext)


                    console.log('插件执行耗时：' + (Date.now() - startTime) + '毫秒');
                },
            })

        }
    }
}

function readCacheFile(searchContext: SearchContext) {
    const startTime = Date.now();
    const cacheDir = getCacheDir(searchContext.projectRootDir);
    try {
        const cacheFile = path.join(cacheDir, CACHE_FILE);
        const fileContent = fs.readFileSync(cacheFile, 'utf8');
        const fileCaches = new Map(Object.entries(JSON.parse(fileContent)));
        searchContext.fileCaches = fileCaches
    } catch (e) {
        searchContext.fileCaches = new Map();
        // searchContext.cacheFileMaps = new Map();
    }

    try {
        const routeModelCacheFile = path.join(cacheDir, MODEL_CACHE_FILE)
        const routeModelCachesStringContent = fs.readFileSync(routeModelCacheFile, 'utf8');
        const routeModelCaches = JSON.parse(routeModelCachesStringContent);
        searchContext.routeModelCaches = routeModelCaches
    } catch (e) {
        searchContext.routeModelCaches = []
        // console.log('modelCacheContent read failed',e)
    }

    console.log('readCacheFile耗时：' + (Date.now() - startTime) + '毫秒')
}

function writeCacheFile(searchContext: SearchContext) {
    const startTime = Date.now();

    const cacheDir = getCacheDir(searchContext.projectRootDir);
    const cacheFile = path.join(cacheDir, CACHE_FILE);

    // 写入文件（将 Map 转为可序列化的对象）
    const serializableMap = Object.fromEntries(searchContext.currentScanFiles);
    fs.writeFileSync(cacheFile, JSON.stringify(serializableMap), { encoding: 'utf8' });

    const modelCacheFile = path.join(cacheDir, MODEL_CACHE_FILE)

    const mergeResult = searchContext.allRouteModels()
    fs.writeFileSync(modelCacheFile, JSON.stringify(mergeResult), { encoding: 'utf8' });

    console.log('写入缓存文件耗时：' + (Date.now() - startTime) + '毫秒')
}

function initCacheDir(projectRootDir: string) {
    const cacheDir = path.join(projectRootDir, '.cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
}

function getCacheDir(projectRootDir: string) {
    return path.join(projectRootDir, '.cache');
}

const DEFAULT_HOST = 'native'
const GEN_DIR = 'src/main/ets/gen'
const CACHE_FILE = 'xrouter_cache.json'
const MODEL_CACHE_FILE = 'xrouter_model_cache.json'

const project = new Project({
    compilerOptions: {
        target: ScriptTarget.Latest,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        lib: ['ES2017', 'ESNext']
    },
    useInMemoryFileSystem: false,
});

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function clearGenerateFiles(searchContext: SearchContext) {
    const xRouterGenDir = path.join(searchContext.entryDir, GEN_DIR)
    console.log(">>xRouterGenDir",xRouterGenDir)
    const scanFileHashSet = new Set();
    //所有扫描过的文件
    searchContext.currentScanFiles.forEach((value, key) => {
        scanFileHashSet.add(value)
    })
    // console.log(">>hash",scanFileHashSet)


    // 过滤掉不存在的RouterModel缓存
    searchContext.routeModelCaches = searchContext.routeModelCaches.filter((m: any) => {
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

function getRouteGenerateDir(searchContext: SearchContext) {
    const entryName = path.basename(searchContext.entryDir);
    const xRouterGenDir = path.join(searchContext.entryDir, GEN_DIR)
    fs.mkdirSync(xRouterGenDir, { recursive: true });
    return xRouterGenDir;
}

function generateRouteInitializeFiles(getRouteGenerateDir:string,entryName:string,routeModels: Array<RouteModel>) {
    for (let routeModel of routeModels) {
        const xRouterInitializeFile =
            path.join(getRouteGenerateDir,
                `XRouter${(routeModel.host ?? DEFAULT_HOST).capitalize()}${routeModel.path.capitalize()}Initialize.ets`)
        let packagePath = ''
        if (routeModel.group !== 'source') {
            packagePath = `${routeModel.group}/${routeModel.moduleName}/${routeModel.srcPath}`
        } else {
            packagePath = `${routeModel.moduleName}/${routeModel.srcPath}`
            //当前entry 下 不能模块引用
            if (routeModel.moduleName === entryName) {
                packagePath = path.relative(GEN_DIR, routeModel.srcPath)
            }
        }

        const xRouterInitializeCode = `
import { XRouterManager } from "@victor/xrouter"
import { ${routeModel.pageName} } from "${packagePath}"

@Builder
function XRouterBuilder() {
  ${routeModel.pageName}()
}

function init(){
  XRouterManager.getInstance().register('${routeModel.host ?? DEFAULT_HOST}://${routeModel.path}', wrapBuilder<[]>(XRouterBuilder))
}

init()`
        fs.writeFileSync(xRouterInitializeFile, xRouterInitializeCode, { encoding: 'utf8' });

    }
}

function generateNewRouteInitializeFiles(searchContext: SearchContext) {
    const startTime = Date.now();
    const generateDir = getRouteGenerateDir(searchContext);
    const entryName = path.basename(searchContext.entryDir);
    generateRouteInitializeFiles(generateDir,entryName,searchContext.currentScanNewRouteModels)
    console.log('generateNewRouteInitializeFiles耗时：' + (Date.now() - startTime) + '毫秒');
}
//因为有可能被意外删除，所以要判断文件是否存在，重新生成
function generateCacheRouteInitializeFiles(searchContext: SearchContext) {
    const startTime = Date.now();
    const generateDir = getRouteGenerateDir(searchContext);
    const entryName = path.basename(searchContext.entryDir);
    const loseRouteModel = []
    for (let routeModel of searchContext.routeModelCaches) {
        const xRouterInitializeFile =
            path.join(generateDir,
                `XRouter${(routeModel.host ?? DEFAULT_HOST).capitalize()}${routeModel.path.capitalize()}Initialize.ets`)
        if (!fs.existsSync(xRouterInitializeFile)) {
            loseRouteModel.push(routeModel)
        }
    }
    generateRouteInitializeFiles(generateDir,entryName,loseRouteModel)

    console.log('generateNewRouteInitializeFiles耗时：' + (Date.now() - startTime) + '毫秒');
}

function genXRouterConfig(searchContext: SearchContext) {
    const startTime = Date.now();
    const xRouterGenDir = path.join(searchContext.entryDir, 'src/main/ets/gen')
    //TODO xRouterGenDir下创建XRouterConfig.ets 文件,并写入相关内容
    const xRouterConfigFile = path.join(xRouterGenDir, 'XRouterConfig.ets')
    const allRouteModels = searchContext.allRouteModels()
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
    console.log('genXRouterConfig耗时：' + totalTime + '毫秒');

}


function findXRouterModels(searchContext: SearchContext) {
    const startTime = Date.now();
    try {
        const libraryResult = findXRouterPageByOhModules(searchContext)
        // console.log("libraryResult=", libraryResult)
        const sourceResult = findXRouterPageBySource(searchContext)
        // console.log("sourceResult=", sourceResult)
        searchContext.currentScanNewRouteModels = [...libraryResult, ...sourceResult]
    } catch (e) {
        searchContext.currentScanNewRouteModels = []
        // console.log('findXRouterModels failed：', e)
    }
    console.log('findXRouterModels耗时：' + (Date.now() - startTime) + '毫秒')
}


function findXRouterPageBySource(searchContext: SearchContext): Array<RouteModel> {
    const result = new Array<RouteModel>();
    const buildProfilePath = searchContext.projectRootDir + '/build-profile.json5'
    const buildProfileJson = fs.readFileSync(buildProfilePath, 'utf-8');
    const buildProfile = json5.parse(buildProfileJson);

    // 获取modulePaths
    const modulePaths = new Array<XModule>();
    const modules = buildProfile.modules;
    for (const module of modules) {
        const modulePath = module.srcPath;
        let moduleDir = '';
        if (modulePath.startsWith('/')) {
            moduleDir = modulePath;
        } else {
            moduleDir = path.join(searchContext.projectRootDir, modulePath);
        }
        const xModule = new XModule();
        xModule.name = module.name;
        xModule.dir = moduleDir;
        modulePaths.push(xModule)
        // console.log('moduleDir=', moduleDir)
    }
    //查找符合条件的页面
    for (let modulePath of modulePaths) {
        const sourceDir = modulePath.dir + '/src'
        //group 为source 是特殊标识
        findXRouterPageByPath(searchContext, "source", modulePath.name, "", sourceDir, result)
    }
    return result;
}

function findXRouterPageByOhModules(searchContext: SearchContext): Array<RouteModel> {
    const moduleResult = new Array<RouteModel>();
    const oh_modules_ohpm = searchContext.projectRootDir + '/oh_modules/.ohpm'
    const moduleFiles = fs.readdirSync(oh_modules_ohpm, { withFileTypes: true });
    // const moduleFiles = await fs.readdir(oh_modules_ohpm, { withFileTypes: true });
    moduleFiles.forEach(file => {
        if (file.isDirectory()) {
            const regex = /([^+]+)\+([^@]+)@(.+)/;
            const matchResult = file.name.match(regex);
            if (!matchResult || matchResult.length < 4) {
                console.warn(`${file.name} 此库被跳过`)
                return
            }
            const group = matchResult[1];
            const moduleName = matchResult[2];
            const version = matchResult[3];
            // console.log('group=', group, 'moduleName=', moduleName, 'version=', version)
            const moduleDir = oh_modules_ohpm + '/' + file.name + '/oh_modules' + '/' + group + '/' + moduleName;
            // console.log('moduleDir=', moduleDir)
            findXRouterPageByPath(searchContext, group, moduleName, version, moduleDir, moduleResult)
        }
    })
    return moduleResult;
}

function findXRouterPageByPath(searchContext: SearchContext, group: string, moduleName: string, version: string,
    currentPath: string,
    result: Array<RouteModel>) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile() && currentPath.endsWith('.ets')) {
        //TODO以下内容比较耗时，所以想文件没有变动情况下就不再重新解析
        const hash = getFileHash(currentPath)

        // console.log('searchContext.fileCaches',searchContext.fileCaches)
        if (searchContext.fileCaches.get(currentPath) === hash) {
            // console.log('已经解析过', currentPath, 'hash=', hash)
            searchContext.currentScanFiles.set(currentPath, hash);
            return;
        }
        searchContext.currentScanFiles.set(currentPath, hash);
        const routeModel = parseRouteModel(searchContext.projectRootDir, currentPath)
        if (routeModel) {
            routeModel.group = group;
            routeModel.moduleName = moduleName;
            routeModel.version = version;
            routeModel.fileHash = hash;
            if (group === 'source') {
                routeModel.srcPath = getSourceRelativeEtsPath(searchContext.projectRootDir, currentPath, group, moduleName);
            } else {
                routeModel.srcPath = getRelativeEtsPath(currentPath, group, moduleName);
            }
            result.push(routeModel);
            // console.log('routeModel=', routeModel)
        }
    } else if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            findXRouterPageByPath(searchContext, group, moduleName, version, path.join(currentPath, file), result);
        }
    }
}

function getSourceRelativeEtsPath(projectDir: string, filePath: string, group: string,
    moduleName: string): string | null {
    // console.log(`projectDir=${projectDir},filePath=${filePath}, group=${group}, moduleName=${moduleName} `)
    const relativePath = filePath.substring(projectDir.length + 1 + moduleName.length + 1).replace(/\.ets$/, '');
    return relativePath
}

function getRelativeEtsPath(filePath: string, group: string, moduleName: string): string | null {
    const modulePath = path.join('oh_modules', `${group}/${moduleName}`);
    const moduleIndex = filePath.indexOf(modulePath);

    if (moduleIndex === -1) {
        console.error(`路径中未找到模块: ${moduleName}`);
        return null;
    }
    // 提取模块路径之后的部分
    const relativePath = filePath.substring(moduleIndex + modulePath.length + 1); // +1 是为了去掉斜杠
    // 去除 .ets 后缀
    const normalizedPath = relativePath.replace(/\.ets$/, '');

    return normalizedPath;
}


// function isFileChanged(filePath: string): boolean {
//   const currentHash = getFileHash(filePath);
//   const cachedHash = parsedFilesCache.get(filePath);
//   return currentHash !== cachedHash;
// }

function getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * 从指定 ETS 文件中解析 @Component 类上的 @XRouter 装饰器参数，生成 RouteModel。
 * @param filePath - .ets 文件路径
 * @returns 解析出的 RouteModel 对象，或 undefined（未找到符合条件的类）
 */
function parseRouteModel(projectDir: string, filePath: string): RouteModel | undefined {

    const sourceFile = project.addSourceFileAtPath(filePath);
    const processedFile = preProcessETS(projectDir, sourceFile);

    // 查找所有类声明
    const classes = processedFile.getClasses();
    if (classes.length === 0) {
        // console.warn(`文件 ${filePath} 中未找到任何类定义`);
        return undefined;
    }

    // 找到第一个带有 @Component 的类
    const componentClass = classes.find(cls => cls.getDecorators().some(dec => dec.getName() === 'Component'));

    if (!componentClass) {
        // console.warn(`文件 ${filePath} 中未找到带有 @Component 的类`);
        return undefined;
    }
    const routeModel = new RouteModel();
    const componentClassName = componentClass.getName();
    routeModel.pageName = componentClassName

    // 查找该类上的 @XRouter 装饰器
    const xRouterDecorator = componentClass.getDecorators().find(dec => dec.getName() === 'XRouter');
    if (!xRouterDecorator) {
        // console.warn(`文件 ${filePath} 中的 Component 类未使用 @XRouter 装饰器`);
        return undefined;
    }

    // 获取装饰器参数对象
    const args = xRouterDecorator.getArguments();
    if (args.length === 0) {
        console.error(`@XRouter 装饰器缺少参数：${filePath}`);
        return undefined;
    }

    const options = args[0];
    if (options.getKind() !== SyntaxKind.ObjectLiteralExpression) {
        console.error(`@XRouter 参数必须为对象字面量：${filePath}`);
        return undefined;
    }

    const properties = options.getProperties();


    for (const prop of properties) {
        const propDeclaration = prop.asKind(SyntaxKind.PropertyAssignment);
        if (!propDeclaration) {
            continue;
        }

        const name = prop.getName();
        const initializer = propDeclaration.getInitializer();

        if (!initializer) {
            continue;
        }

        if (initializer.getKind() === SyntaxKind.StringLiteral) {
            const value = (initializer as StringLiteral).getLiteralValue();
            if (name === 'host') {
                routeModel.host = value;
            }
            if (name === 'path') {
                routeModel.path = value;
            }
        }
    }
    routeModel.filePath = filePath
    // console.log('找到一个 routeModel=', routeModel);
    return routeModel;
}


/**
 * 将 .ets 文件中的 `struct` 关键字替换为 `class`，以适配 ts-morph 的解析。
 * @param sourceFile - 要处理的源文件对象
 * @returns 处理后的新 SourceFile 实例
 */
function preProcessETS(projectDir: string, sourceFile: SourceFile): SourceFile {
    const structure = sourceFile.getStructure();

    // 过滤并转换 struct 为 class
    const adaptedStatements = [];
    if (structure.statements && Array.isArray(structure.statements)) {
        for (const statement of structure.statements) {
            if (statement === 'struct') {
                adaptedStatements.push('class');
            } else {
                adaptedStatements.push(statement);
            }
        }
    }

    // 构建临时文件路径
    const tempFilePath = path.join(
        projectDir,
        '.cache',
        'xrouter-convert',
        sourceFile.getBaseName()
    );

    // 确保目录存在
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // 创建新 SourceFile
    return sourceFile.getProject().createSourceFile(tempFilePath, {
        kind: StructureKind.SourceFile,
        statements: adaptedStatements,
    }, {
        overwrite: true,
        scriptKind: ScriptKind.TSX,
    });
}