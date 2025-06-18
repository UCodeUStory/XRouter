# Harmony XRouter 

## 介绍
一个鸿蒙动态路由框架，可以非常方便的实现组件之间的跳转，方便组件的解耦

## 系统环境
- HarmonyOS 5.0.0
- compileSdkVersion
  12
- minSdkVersion
  12

## 快速接入

### 步骤1：安装说明
```
   1.1 在 hvigor-config.json5中添加插件-> "xrouter-plugin": "1.0.3",
   1.2 安装依赖-> ohpm install @victor/xrouter
```

### 步骤2：初始化路由


```ts
  pageInfos:NavPathStack = new NavPathStack()
    
  aboutToAppear(): void {
    //1 绑定路由
    XRouterManager.getInstance().bindNavPathStack(this.pageInfos)
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
  pageBuilder(name:string,paramMap:Map<string,Object>){
    XRouterManager.getInstance().get(name)?.builder()
  }
```

###  步骤3：生成路由配置信息
XRouterConfig 是动态生成的类，先执行Rebuild project 生成这个信息配置



### 步骤4：路由定义及使用

1.在页面上添加注解定义
```
  //host 可以不传，默认是native
  @XRouter({host:'native',path:'demo'})
  @Component
  export struct Demo {
    @State message: string = 'Hello World';
  
    build() {
      NavDestination(){
        Text("Demo page")
      }
    }
  }
```
2.跳转
```
XRouterNavigator.push('native://demo')
```

