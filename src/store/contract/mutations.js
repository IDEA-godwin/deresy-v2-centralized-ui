export default {
  SET_PROVIDER(state, payload) {
    state.provider = payload;
  },

  SET_SIGNER(state, payload) {
    state.signer = payload;
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
    state.signer = null;
    state.contract = null;
    state.easSchemaIDs = {
      reviewsSchemaID: null,
      amendmentsSchemaID: null,
    };
  },
};
