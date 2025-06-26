
import { XRouterManager } from "@ustory/xrouter"
import { ThirdPage } from "../pages/ThirdPage"

@Builder
function XRouterBuilder(param:Object) {
  ThirdPage({pageParam: param})
}

function init(){
  XRouterManager.getInstance().register('native://third', wrapBuilder<Object[]>(XRouterBuilder))
}

init()