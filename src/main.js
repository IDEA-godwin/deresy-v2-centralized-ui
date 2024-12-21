import { createApp } from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import Notifications from "@kyvg/vue3-notification";
import { WagmiPlugin } from "@wagmi/vue";
import { getWagmiConfig } from "./utils/config";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";


const queryClient = new QueryClient()

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(Notifications)
  .use(WagmiPlugin, { config: getWagmiConfig() })
  .use(VueQueryPlugin, { queryClient })
  .mount("#app");
