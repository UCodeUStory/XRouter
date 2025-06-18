import { SearchContext } from "./xrouter-model";



// 定义处理器接口
export interface XRouterHandler {
  setNext(handler: XRouterHandler): XRouterHandler;

  handle(context: SearchContext): void;
}

// 基础抽象类，支持链式调用
export abstract class AbstractXRouterHandler implements XRouterHandler {
  private nextHandler?: XRouterHandler;

  public setNext(handler: XRouterHandler): XRouterHandler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(context: SearchContext): void {
    this.doHandle(context);

  }

  public process(context){
    if (this.nextHandler) {
      this.nextHandler.handle(context);
    }
  }

  protected abstract doHandle(context: SearchContext): void;
}

export class InitHandler extends AbstractXRouterHandler{
  protected doHandle(context: SearchContext): void {
    console.log('InitHandler  init')
    this.process(context)
  }
}