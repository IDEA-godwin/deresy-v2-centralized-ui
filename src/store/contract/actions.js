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
      const contract = state.contract;
      const reviewsSchemaID = await contract.reviewsSchemaID();
      const amendmentsSchemaID = await contract.amendmentsSchemaID();

      console.log(reviewsSchemaID, amendmentsSchemaID)

      commit("SET_EAS_SCHEMA_IDS", { reviewsSchemaID, amendmentsSchemaID });
    } catch (error) {
      console.error("Error getting schema IDs from contract: ", error);
    }
  },

  setProvider({ commit }, provider) {
    commit("SET_PROVIDER", provider);
  },

  setSigner({ commit }, signer) {
    commit("SET_S", signer);
  },

  resetContractInformation({ commit }) {
    commit("RESET_CONTRACT_INFORMATION");
  },
};
