# Harmony XRouter 

## 介绍
一个鸿蒙动态路由框架，基于Navigation的路由框架，可以非常方便的使用注解注册，就能实现组件之间的跳转，方便组件的解耦

## 系统环境
- HarmonyOS 5.0.0
- compileSdkVersion
  12
- minSdkVersion
  12

## 快速接入

### 步骤1：安装说明
```
   1.1 在 hvigor-config.json5中添加插件-> "xrouter-plugin": "1.0.14", 
     具体请使用最新版本：https://www.npmjs.com/package/xrouter-plugin 
     
     在项目入口module的hvigorfile.ts中配置插件：
     import { XRouterPlugin } from 'xrouter-plugin'
     export default {
       system: hapTasks,
       plugins: [XRouterPlugin()]
     }
     
   1.2 安装依赖-> ohpm install @ustory/xrouter
```

### 步骤2：初始化路由


```ts
  pageInfos:NavPathStack = new NavPathStack()
    
  aboutToAppear(): void {
    //1 绑定路由
    XRouterManager.getInstance().bindNavPathStack(this.pageInfos)
    //XRouteConfig 需要rebuild Project 动态生成一下
    XRouterManager.getInstance().bindRouteConfig(XRouterConfig.initialize)
  }

  build() {
    Navigation(this.pageInfos){
      NavDestination(){
        ...
      }
    }.navDestination(this.pageBuilder)
  }
   //2 绑定路由构建器
  @Builder
  pageBuilder(name: string, param: Object) {
    XRouterManager.getInstance().get(name)?.builder(param)
  }
```

###  步骤3：生成路由配置信息

   ``XRouterConfig 是动态生成的类，先执行Rebuild project 生成这个信息配置``


### 步骤4：路由定义及使用

1.在页面上添加注解定义
```
  //host 可以不传，默认是native
  @XRouter({host:'native',path:'demo'})
  @Component
  export struct Demo {
    
    @XRouteParam() //路由参数，注意：只能声明一个
    pageParam?:Object
  
    build() {
      NavDestination(){
        Text("Demo page")
      }
    }
  }
```
2.跳转
```
XRouterNavigator.push('native://demo',{param: 789})
```

### 注意事项
- 注解方式不支持解析字节码HAR ,此时需要采用手动注册方式,具体可以代理 XRouterConfig

```
  例子：
  async proxyXRouterConfig(path:string){
    switch (path){
      case "native://custom":{
        await import('./CustomInitialize')
        break;
      }
    }
    XRouterConfig.initialize(path)
  }
  
  XRouterManager.getInstance().bindRouteConfig(this.proxyXRouterConfig)
  
 
```

```
  //CustomInitialize.ets 内容
  import { XRouterManager } from '@ustory/xrouter'
  import { CustomPage } from './CustomPage'
  
  @Builder
  function XRouterBuilder(param:Object) {
    CustomPage({pageParam: param})
  }
  
  function init(){
    XRouterManager.getInstance().register('native://custom', wrapBuilder<Object[]>(XRouterBuilder))
  }
  
  init()
```

-  路由构建会有缓存信息，如果插件升级导致一直生成失败，可以将项目目录下.cache 删除，再次重试

## XRouterNavigator API 文档
### push

| 参数                 | 类型                        | 说明                             |
|--------------------| ------------------------- |--------------------------------|
| url                | `string`                  | 目标页面的路由地址                      |
| option             | `PushOption`（可选）          | 跳转选项                           |
| option.param       | `Object`（可选）              | 传递给目标页面的参数                     |
| option.onPopResult | `(data: any) => void`（可选） | 接收返回结果作为参数，仅当调用pop相关方法传递参数时才回调 |
| option.onClose     | `() => void`（可选） | 上一个页面被关闭时回调                       |
| option.animated    | `boolean`（可选）             | 是否启用动画效果                       |

### pop 

| 参数              | 类型              | 说明                                                            |
| --------------- | --------------- | ------------------------------------------------------------- |
| option          | `PopOption`（可选） | 返回选项                                                          |
| option.result   | `any`（可选）       | 返回结果                                                          |
| option.animated | `boolean`（可选）   | 是否启用动画效果                                                      |

### popToRoot

| 参数              | 类型              | 说明                                                                                                  |
| --------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| option          | `PopOption`（可选） | 返回选项                                                                                                |
| option.result   | `any`（可选）       | 返回结果                                                                                                |
| option.animated | `boolean`（可选）   | 是否启用动画效果                                                                                            |

### popUntil

| 参数              | 类型              | 说明        |
|-----------------|-----------------|-----------|
| url             | `string`        | 目标页面的路由地址 |
| option          | `PopOption`（可选） | 返回选项      
| option.result   | `any`（可选）       | 返回结果      |
| option.animated | `boolean`（可选）   | 是否启用动画效果  |


### replace

| 参数       | 类型            | 说明                                                                                                  |
| -------- | ------------- | --------------------------------------------------------------------------------------------------- |
| url      | `string`      | 目标页面的路由地址                                                                                           |
| params   | `Object`（可选）  | 传递给目标页面的参数                                                                                          |
| animated | `boolean`（可选） | 是否启用动画效果                                                                                            |

### onPopToRootResult 监听popToRoot携带的返回结果

## xrouter-plugin API

| 属性名       | 类型      | 是否必填 | 默认值                | 描述                    |
| --------- | ------- | ---- |--------------------|-----------------------|
| debugMode | boolean | 否    | false              | 是否开启调试模式,调试模式会有日志输出   |
| genDir    | string  | 否    | 'src/main/ets/gen' | 自定义生成路由文件的目录路径 |
