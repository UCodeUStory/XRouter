//
interface XRouterOption {
  path: string;
  host?: string; //默认native
}

//
export function XRouter(option: XRouterOption): ClassDecorator {
  console.log(` ClassDecorator`, option);
  return () => {
  }
}

export function RouterParam(): PropertyDecorator {
  console.log(` PropertyDecorator`);
  return () => {
  }
}