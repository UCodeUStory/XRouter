//
interface XRouterOption {
  path: string;
  host?: string; //默认native
}

export function XRouter(option: XRouterOption): ClassDecorator {
  return () => {
  }
}

export function XRouteParam(): PropertyDecorator {
  return () => {
  }
}