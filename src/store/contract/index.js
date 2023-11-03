import actions from "./actions";
import mutations from "./mutations";

const state = {
  provider: null,
  web3: null,
  contract: null,
  easSchemaIDs: {
    reviewsSchemaID: null,
    amendmentsSchemaID: null,
  },
};

export default {
  namespaced: false,
  actions,
  mutations,
  state,
};
