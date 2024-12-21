import actions from "./actions";
import mutations from "./mutations";

const state = {
  wagmiConfig: null,
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
