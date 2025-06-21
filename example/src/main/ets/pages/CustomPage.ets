import { XRouter,XRouteParam } from '@ustory/xrouter';

@Component
export struct CustomPage {
  @State message: string = 'Hello World';

  pageParam?:Object

  aboutToAppear(): void {
    console.log("aboutToAppear="+JSON.stringify(this.pageParam))
  }

  build() {
    NavDestination(){
      Text("second page")
    }
  }
}


