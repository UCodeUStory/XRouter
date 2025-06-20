import { XRouterManager, XRouterNavigator } from '@ustory/xrouter';
import { XRouterConfig } from '../gen/XRouterConfig';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  pageInfos: NavPathStack = new NavPathStack()

  aboutToAppear(): void {
    XRouterManager.getInstance().bindNavPathStack(this.pageInfos).bindRouteConfig(this.proxyXRouterConfig)
  }

  async proxyXRouterConfig(path:string){
    switch (path){
      case "native://custom":{
        await import('./CustomInitialize')
        break;
      }
    }
    XRouterConfig.initialize(path)
  }



  build() {
    Navigation(this.pageInfos) {
      NavDestination() {
        Button('测试').onClick(() => {
          XRouterNavigator.push('native://second')
        }).margin(50)
      }
    }.navDestination(this.pageBuilder)
  }

  @Builder
  pageBuilder(name: string, param: Object) {
    XRouterManager.getInstance().get(name)?.builder(param)
  }
}