import { HvigorNode, HvigorPlugin, HvigorTask, getNode } from '@ohos/hvigor';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import json5 from 'json5'
import { Project, SyntaxKind, ScriptTarget, StructureKind, ScriptKind } from "ts-morph";
import { RouteModel, XModule, SearchContext } from './xrouter-model'

import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { getNode, HvigorNode, HvigorTask } from '@ohos/hvigor';
import * as fs from 'fs';
import * as path from 'path';
import { RouteModel, XModule, SearchContext } from './xrouter-model.ts'
import { ScanModulesHandler } from './xrouter-scan.ts'
import { ReadCacheHandler, WriteCacheHandler } from './xrouter-cache.ts'
import { GenerateRoutesHandler } from './xrouter-generator'
import { InitHandler } from './xrouter-handler.ts'
import { Logger } from './xrouter-logger.ts'

interface XRouterOption {
  debugMode?: boolean
}

export function XRouterPlugin(option?:XRouterOption): HvigorPlugin {
  return {
    pluginId: 'XRouterPlugin',
    apply(node: HvigorNode) {
      node.registerTask({
        name: "XRouterTask",
        dependencies: ['default@PreBuild'],
        postDependencies: ['default@CreateBuildProfile'],
        run: (taskContext) => {

          const startTime = Date.now();
          Logger.get().debugMode = option?.debugMode || false;
          console.log("----------欢迎使用XRouter--------")
          const searchContext = new SearchContext(path.dirname(taskContext.modulePath), taskContext.modulePath);

          const xRouterHandler = new InitHandler()
          xRouterHandler.setNext(new ReadCacheHandler())
            .setNext(new ScanModulesHandler())
            .setNext(new GenerateRoutesHandler())
            .setNext(new WriteCacheHandler());
          xRouterHandler.handle(searchContext);
          console.log('-------XRouter插件代码生成结束：执行耗时：' + (Date.now() - startTime) + '毫秒------');
        },
      })
    }
  }
}
