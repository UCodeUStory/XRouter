import { XRouter,XRouteParam, XRouterNavigator, XRouterManager } from '@ustory/xrouter';

@XRouter({host:'native',path:'third'})
@Component
export struct ThirdPage {
  @State message: string = 'Hello World';

  @XRouteParam()
  pageParam?:Object

  aboutToAppear(): void {
    console.log("aboutToAppear="+JSON.stringify(this.pageParam))
  }

  build() {
    NavDestination(){
      Text("third page").fontColor(Color.Black)
      Button("返回测试").margin({top:40}).onClick(()=>{
        XRouterNavigator.pop({result:"third Page Result"})
      })
      Button("replace跳转测试").margin({top:40}).onClick(()=>{
        XRouterNavigator.replace("native://fourth")
      })
      Button("push跳转测试").margin({top:40}).onClick(()=>{
        XRouterNavigator.push("native://fourth")
      })
    }.backgroundColor('#ffffff')
  }
}