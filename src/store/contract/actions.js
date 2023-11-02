export default {
  setContract({ commit }, contract) {
    commit("SET_CONTRACT", contract);
  },

  async setEasSchemaIDs({ commit, state }) {
    if (!state.contract) {
      console.error("Contract not set.");
      return;
    }

    try {
      const { methods } = state.contract;
      const reviewsSchemaID = await methods.reviewsSchemaID().call();
      const amendmentsSchemaID = await methods.amendmentsSchemaID().call();

      commit("SET_EAS_SCHEMA_IDS", { reviewsSchemaID, amendmentsSchemaID });
    } catch (error) {
      console.error("Error getting schema IDs from contract: ", error);
    }
  },

  setProvider({ commit }, provider) {
    commit("SET_PROVIDER", provider);
  },

  setWeb3({ commit }, web3) {
    commit("SET_WEB3", web3);
  },
};
