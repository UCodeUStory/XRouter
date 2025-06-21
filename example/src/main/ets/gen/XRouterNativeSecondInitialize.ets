
import { XRouterManager } from "@ustory/xrouter"
import { Second } from "../pages/Second"

@Builder
function XRouterBuilder(param:Object) {
  Second({pageParam: param})
}

function init(){
  XRouterManager.getInstance().register('native://second', wrapBuilder<Object[]>(XRouterBuilder))
}

init()