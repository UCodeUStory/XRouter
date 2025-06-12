import { XRouterManager, XRouterNavigator } from '@victor/xrouter';
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
          XRouterNavigator.push('native://second')
        }).margin(50)
      }
    }.navDestination(this.pageBuilder)
  }
  @Builder
  pageBuilder(name:string,paramMap:Map<string,Object>){
    XRouterManager.getInstance().get(name)?.builder()
  }
}