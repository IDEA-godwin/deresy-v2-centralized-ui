import actions from "./actions";
import mutations from "./mutations";

const state = {
  loading: false,
};

export default {
  namespaced: false,
  actions,
  mutations,
  state,
};
