import { XRouterManager, XRouterNavigator } from '@ustory/xrouter';
import { XRouterConfig } from '../gen/XRouterConfig';
import { promptAction } from '@kit.ArkUI';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  pageInfos: NavPathStack = new NavPathStack()

  aboutToAppear(): void {
    XRouterManager.getInstance().bindNavPathStack(this.pageInfos).bindRouteConfig(this.proxyXRouterConfig)
  }

  async proxyXRouterConfig(path: string) {
    switch (path) {
      case "native://custom": {
        await import('./CustomInitialize')
        break;
      }
    }
    XRouterConfig.initialize(path)
  }

  build() {
    Navigation(this.pageInfos) {
      NavDestination() {
        Text("home page").fontColor(Color.Black)
        Button('跳转SecondPage').onClick(() => {
          XRouterNavigator.push('native://second', {
            param: 789, onPopResult: (result) => {
              promptAction.showToast({ message: JSON.stringify(result), duration: 1500 })
            }
          })
        }).margin(50)
      }.backgroundColor('#ffffff')
    }.navDestination(this.pageBuilder).backgroundColor('#ffffff')
  }

  @Builder
  pageBuilder(name: string, param: Object) {
    XRouterManager.getInstance().get(name)?.builder(param)
  }
}