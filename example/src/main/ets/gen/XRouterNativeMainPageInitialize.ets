
import { XRouterManager } from "@ustory/xrouter"
import { MainPage } from "sample_library/src/main/ets/components/MainPage"

@Builder
function XRouterBuilder() {
  MainPage()
}

function init(){
  XRouterManager.getInstance().register('native://MainPage', wrapBuilder<Object[]>(XRouterBuilder))
}

init()