import { XRouter,XRouteParam } from '@ustory/xrouter';

@XRouter({host:'native',path:'second'})
@Component
export struct Second {
  @State message: string = 'Hello World';

  @XRouteParam()
  pageParam?:Object

  build() {
    NavDestination(){
      Text("second page")
    }
  }
}


