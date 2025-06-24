import { XRouter,XRouteParam, XRouterNavigator, XRouterManager } from '@ustory/xrouter';

@XRouter({host:'native',path:'second'})
@Component
export struct Second {
  @State message: string = 'Hello World';

  @XRouteParam()
  pageParam?:Object

  aboutToAppear(): void {
    console.log("aboutToAppear="+JSON.stringify(this.pageParam))
  }

  build() {
    NavDestination(){
      Text("second page").fontColor(Color.Black)
      Button("返回测试").margin({top:40}).onClick(()=>{
        XRouterNavigator.pop({result:"Second Page Result"})
      })
    }.backgroundColor('#ffffff')
  }
}


