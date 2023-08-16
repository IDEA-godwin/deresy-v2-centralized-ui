import { createStore } from "vuex";
import VuexPersistence from "vuex-persist";

import contract from "./contract";
import user from "./user";
import root from "./root";

export default createStore({
  modules: {
    contractState: contract,
    user: user,
    root: root,
  },
  plugins: [
    new VuexPersistence({
      modules: ["contract", "user", "root"],
    }).plugin,
  ],
});
