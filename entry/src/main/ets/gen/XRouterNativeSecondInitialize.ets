
import { XRouterManager } from "@victor/xrouter"
import { Second } from "../pages/Second"

@Builder
function XRouterBuilder() {
  Second()
}

function init(){
  XRouterManager.getInstance().register('native://second', wrapBuilder<[]>(XRouterBuilder))
}

init()