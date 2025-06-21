import { XRouter,XRouteParam } from '@ustory/xrouter';

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
      Text("second page")
    }
  }
}


