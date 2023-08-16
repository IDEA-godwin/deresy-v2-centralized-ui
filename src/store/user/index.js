import actions from "./actions";
import mutations from "./mutations";

const state = {
  balance: null,
  networkId: null,
  walletAddress: null,
};

export default {
  namespaced: false,
  actions,
  mutations,
  state,
};
