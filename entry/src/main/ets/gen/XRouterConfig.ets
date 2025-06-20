
//自动生成类
export class XRouterConfig {
  //动态导入
  static async initialize(path: string) {
    switch (path) {
      case 'native://second':
        await import('./XRouterNativeSecondInitialize')
        break;
    
      case 'native://MainPage':
        await import('./XRouterNativeMainPageInitialize')
        break;
    
    }
  }
}
          