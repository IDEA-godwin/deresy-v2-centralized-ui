export default {
  resetWalletInformation({ commit }) {
    commit("RESET_WALLET_INFORMATION");
  },

  setWalletInformation({ commit }, walletInformation) {
    commit("SET_WALLET_INFORMATION", walletInformation);
  },

  setWalletAddress({ commit }, walletAddress) {
    commit("SET_WALLET_ADDRESS", walletAddress);
  },

  setNotifyWhitelistedSettings({ commit }, notifyWhitelistedSettings) {
    commit("SET_NOTIFY_WHITELISTED_SETTINGS", notifyWhitelistedSettings);
  },
};
