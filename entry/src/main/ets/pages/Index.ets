import { XRouterManager, XRouterNavigator } from '@ustory/xrouter';
import { XRouterConfig } from '../gen/XRouterConfig';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  pageInfos:NavPathStack = new NavPathStack()

  aboutToAppear(): void {
    XRouterManager.getInstance().bindNavPathStack(this.pageInfos)
    XRouterManager.getInstance().bindRouteConfig(XRouterConfig.initialize)
  }

  build() {
    Navigation(this.pageInfos){
      NavDestination(){
        Button('测试').onClick(()=>{
          XRouterNavigator.push('native://second',123)
        }).margin(50)
      }
    }.navDestination(this.pageBuilder)
  }
  @Builder
  pageBuilder(name:string,param:Object){
    XRouterManager.getInstance().get(name)?.builder(param)
  }
}