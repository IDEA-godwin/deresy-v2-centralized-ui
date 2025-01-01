export default {
  SET_WAGMI_CONFIG(state, payload) {
    state.wagmiConfig = payload;
  },

  SET_EAS_SCHEMA_IDS(state, payload) {
    state.easSchemaIDs.reviewsSchemaID = payload.reviewsSchemaID;
    state.easSchemaIDs.amendmentsSchemaID = payload.amendmentsSchemaID;
  },

  RESET_CONTRACT_INFORMATION(state) {
    state.wagmiConfig = null
    state.easSchemaIDs = {
      reviewsSchemaID: null,
      amendmentsSchemaID: null,
    };
  },
};
