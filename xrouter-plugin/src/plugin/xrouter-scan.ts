import * as fs from 'fs';
import * as path from 'path';
import json5 from 'json5'
import { Project, SyntaxKind, ScriptTarget, StructureKind, ScriptKind } from "ts-morph";
import * as crypto from 'crypto';
import { RouteModel, SearchContext, XModule } from "./xrouter-model";
import { AbstractXRouterHandler } from './xrouter-handler';

export class ScanModulesHandler extends AbstractXRouterHandler {
  protected doHandle(searchContext: SearchContext): void {
    const scanner = new XRouterScanner(searchContext);
    scanner.findXRouterModels()
    this.process(searchContext)
  }
}

class XRouterScanner {
  private searchContext: SearchContext

  private project = new Project({
    compilerOptions: {
      target: ScriptTarget.Latest,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      lib: ['ES2017', 'ESNext']
    },
    useInMemoryFileSystem: false,
  });

  constructor(context: SearchContext) {
    this.searchContext = context
  }


  findXRouterModels() {
    const startTime = Date.now();
    try {
      const libraryResult = this.findXRouterPageByOhModules(this.searchContext)
      // console.log("libraryResult=", libraryResult)
      const sourceResult = this.findXRouterPageBySource(this.searchContext)
      // console.log("sourceResult=", sourceResult)
      this.searchContext.currentScanNewRouteModels = [...libraryResult, ...sourceResult]
    } catch (e) {
      this.searchContext.currentScanNewRouteModels = []
      // console.log('findXRouterModels failed：', e)
    }
    console.log('findXRouterModels耗时：' + (Date.now() - startTime) + '毫秒')
  }


  findXRouterPageBySource(searchContext: SearchContext): Array<RouteModel> {
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
      this.findXRouterPageByPath(searchContext, "source", modulePath.name, "", sourceDir, result)
    }
    return result;
  }

  findXRouterPageByOhModules(searchContext: SearchContext): Array<RouteModel> {
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
        this.findXRouterPageByPath(searchContext, group, moduleName, version, moduleDir, moduleResult)
      }
    })
    return moduleResult;
  }

  findXRouterPageByPath(searchContext: SearchContext, group: string, moduleName: string, version: string,
    currentPath: string,
    result: Array<RouteModel>) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile() && currentPath.endsWith('.ets')) {
      //TODO以下内容比较耗时，所以想文件没有变动情况下就不再重新解析
      const hash = this.getFileHash(currentPath)

      // console.log('searchContext.fileCaches',searchContext.fileCaches)
      if (searchContext.fileCaches.get(currentPath) === hash) {
        // console.log('已经解析过', currentPath, 'hash=', hash)
        searchContext.currentScanFiles.set(currentPath, hash);
        return;
      }
      searchContext.currentScanFiles.set(currentPath, hash);
      const routeModel = this.parseRouteModel(searchContext.projectRootDir, currentPath)
      if (routeModel) {
        routeModel.group = group;
        routeModel.moduleName = moduleName;
        routeModel.version = version;
        routeModel.fileHash = hash;
        if (group === 'source') {
          routeModel.srcPath =
            this.getSourceRelativeEtsPath(searchContext.projectRootDir, currentPath, group, moduleName);
        } else {
          routeModel.srcPath = this.getRelativeEtsPath(currentPath, group, moduleName);
        }
        result.push(routeModel);
        // console.log('routeModel=', routeModel)
      }
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        this.findXRouterPageByPath(searchContext, group, moduleName, version, path.join(currentPath, file), result);
      }
    }
  }


  getSourceRelativeEtsPath(projectDir: string, filePath: string, group: string,
    moduleName: string): string | null {
    const relativePath = filePath.substring(projectDir.length + 1 + moduleName.length + 1).replace(/\.ets$/, '');
    return relativePath
  }

  getRelativeEtsPath(filePath: string, group: string, moduleName: string): string | null {
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

  getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  parseRouteModel(projectDir: string, filePath: string): RouteModel | undefined {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const processedFile = this.preProcessETS(projectDir, sourceFile);

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

    //获取参数
    const allProp = componentClass.getProperties();
    for (const prop of allProp) {
      const decorators = prop.getDecorators();
      for (const decorator of decorators) {
        if (decorator.getName() === 'XRouteParam') {
          const paramName = prop.getName();
          // console.log('XRouteParam>>>> 找到了',paramName)
          routeModel.paramName = paramName;
        }
      }
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


  preProcessETS(projectDir: string, sourceFile: SourceFile): SourceFile {
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
}