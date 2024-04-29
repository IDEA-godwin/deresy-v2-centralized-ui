export default {
  SET_PROVIDER(state, payload) {
    state.provider = payload;
  },

  SET_WEB3(state, payload) {
    state.web3 = payload;
  },

  SET_CONTRACT(state, payload) {
    state.contract = payload;
  },

  SET_EAS_SCHEMA_IDS(state, payload) {
    state.easSchemaIDs.reviewsSchemaID = payload.reviewsSchemaID;
    state.easSchemaIDs.amendmentsSchemaID = payload.amendmentsSchemaID;
  },

  RESET_CONTRACT_INFORMATION(state) {
    state.provider = null;
    state.web3 = null;
    state.contract = null;
    state.easSchemaIDs = {
      reviewsSchemaID: null,
      amendmentsSchemaID: null,
    };
  },
};
