import { hapTasks } from '@ohos/hvigor-ohos-plugin';
// import { getNode, HvigorNode, HvigorTask } from '@ohos/hvigor';
// import * as fs from 'fs';
// import * as path from 'path';
// import json5 from 'json5'
// import { Project, SyntaxKind, ScriptTarget, StructureKind, ScriptKind } from "ts-morph";
// import * as crypto from 'crypto';
import { XRouterPlugin } from '../xrouter-plugin/src/plugin/xrouter-plugin'
import { XRouterPlugin } from 'xrouter-plugin'

export default {
  system: hapTasks,
  plugins: [XRouterPlugin({debugMode:true})]
}
