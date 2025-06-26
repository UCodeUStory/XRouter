import { XRouter, XRouteParam, XRouterNavigator, XRouterManager } from '@ustory/xrouter';

@XRouter({ host: 'native', path: 'fourth' })
@Component
export struct FourthPage {
  @State message: string = 'Hello World';
  @XRouteParam()
  pageParam?: Object

  aboutToAppear(): void {
    console.log("aboutToAppear=" + JSON.stringify(this.pageParam))
  }

  build() {
    NavDestination() {
      Text("fourth page").fontColor(Color.Black)
      Button("pop测试").margin({ top: 40 }).onClick(() => {
        XRouterNavigator.pop({ result: "fourth Page Result" })
      })
      Button("popUtil测试").margin({ top: 40 }).onClick(() => {
        XRouterNavigator.popUtil("native://second",{ result: "popUtil fourth Page Result" })
      })
    }.backgroundColor('#ffffff')
  }
}