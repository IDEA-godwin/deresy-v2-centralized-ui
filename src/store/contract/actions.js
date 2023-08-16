export default {
  setContract({ commit }, contract) {
    commit("SET_CONTRACT", contract);
  },

  setProvider({ commit }, provider) {
    commit("SET_PROVIDER", provider);
  },

  setWeb3({ commit }, web3) {
    commit("SET_WEB3", web3);
  },
};
