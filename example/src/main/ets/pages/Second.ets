import { XRouter, XRouteParam, XRouterNavigator, XRouterManager } from '@ustory/xrouter';
import { promptAction } from '@kit.ArkUI';

@XRouter({ host: 'native', path: 'second' })
@Component
export struct Second {
  @State message: string = 'Hello World';
  @XRouteParam()
  pageParam?: Object

  aboutToAppear(): void {
    console.log("aboutToAppear=" + JSON.stringify(this.pageParam))
  }

  build() {
    NavDestination() {
      Text("second page").fontColor(Color.Black)
      Button("返回测试").margin({ top: 40 }).onClick(() => {
        XRouterNavigator.pop({ result: "Second Page Result" })
      })
      Button("跳转测试").margin({ top: 40 }).onClick(() => {
        XRouterNavigator.push("native://third", {
          onPopResult: (data) => {
            promptAction.showToast({ message: JSON.stringify(data), duration: 1500 })
            console.log("ustory secondPage监听onPopResult->上面页面被关闭")
          },
          onClose: () => {
            console.log("ustory secondPage监听onClose->上面页面被关闭")

            for (let data of XRouterManager.getInstance().getAllPageRecord()) {
              console.log("ustory data",data.url)
            }
          }
        })
      })
    }.backgroundColor('#ffffff')
  }
}