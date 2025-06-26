export class XRouterStack<T> {
  private _items: T[] = [];

  public get data(): T[] {
    return this._items;
  }

  // 添加元素到栈顶
  push(item: T): void {
    this._items.push(item);
  }

  // 从栈顶移除元素并返回
  pop(): T | undefined {
    return this._items.pop();
  }

  // 查看栈顶元素但不移除
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this._items[this._items.length - 1];
  }

  //获取栈顶前一个元素
  peekPrevious(): T | undefined {
    if (this._items.length < 2) {
      return undefined;
    }
    return this._items[this._items.length - 2];
  }

  peekFirst(): T | undefined {
    return this._items[0]
  }


  // 检查栈是否为空
  isEmpty(): boolean {
    return this._items.length === 0;
  }

  // 获取栈的大小
  size(): number {
    return this._items.length;
  }

  // 清空栈
  clear(): void {
    this._items = [];
  }
}