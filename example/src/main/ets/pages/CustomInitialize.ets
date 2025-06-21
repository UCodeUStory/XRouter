import { XRouterManager } from '@ustory/xrouter'
import { CustomPage } from './CustomPage'

@Builder
function XRouterBuilder(param:Object) {
  CustomPage({pageParam: param})
}

function init(){
  XRouterManager.getInstance().register('native://custom', wrapBuilder<Object[]>(XRouterBuilder))
}

init()