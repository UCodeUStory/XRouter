import { XRouter } from '@victor/xrouter';

@XRouter({host:'native',path:'second'})
@Component
export struct Second {
  @State message: string = 'Hello World';

  build() {
    NavDestination(){
      Text("second page")
    }
  }
}


