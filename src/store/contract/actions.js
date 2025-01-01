export default {

  setWagmiConfig({ commit }, config) {
    commit("SET_WAGMI_CONFIG", config);
  },

  setEasSchemaIDs({ commit }, payload) {
    commit("SET_EAS_SCHEMA_IDS", payload);
  },

  resetContractInformation({ commit }) {
    commit("RESET_CONTRACT_INFORMATION");
  },
};
