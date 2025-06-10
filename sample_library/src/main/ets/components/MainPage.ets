import { XRouter } from "@victor/xrouter";

@XRouter({path:'MainPage'})
@Component
export struct MainPage {
  @State message: string = 'MainPage';

  build() {
    NavDestination(){
      Row() {
        Column() {
          Text(this.message)
            .fontSize($r('app.float.page_text_font_size'))
            .fontWeight(FontWeight.Bold)
            .onClick(() => {
              this.message = 'Welcome';
            })
        }
        .width('100%')
      }
      .height('100%')
    }
  }
}
