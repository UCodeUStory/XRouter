
//自动生成类
export class XRouterConfig {
  //动态导入
  static async initialize(path: string) {
    switch (path) {
      case 'native://MainPage':
        await import('./XRouterNativeMainPageInitialize')
        break;
    
      case 'native://fourth':
        await import('./XRouterNativeFourthInitialize')
        break;
    
      case 'native://second':
        await import('./XRouterNativeSecondInitialize')
        break;
    
      case 'native://third':
        await import('./XRouterNativeThirdInitialize')
        break;
    
    }
  }
}
          