import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import * as util from "./utils";
import WxSDK from "@/utils/wxSdk";
import "./style/index.less";

// 生产环境禁用VConsole
if (process.env.NODE_ENV !== "production") {
  const VConsole = require("vconsole");
  new VConsole();
}

Vue.prototype.$sdk = WxSDK;

Vue.prototype.$util = util;

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
