import { createApp } from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import Notifications from "@kyvg/vue3-notification";

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(Notifications)
  .mount("#app");
