
import { XRouterManager } from "@ustory/xrouter"
import { FourthPage } from "../pages/FourthPage"

@Builder
function XRouterBuilder(param:Object) {
  FourthPage({pageParam: param})
}

function init(){
  XRouterManager.getInstance().register('native://fourth', wrapBuilder<Object[]>(XRouterBuilder))
}

init()