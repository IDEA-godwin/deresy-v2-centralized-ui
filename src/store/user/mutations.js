export default {
  RESET_WALLET_INFORMATION(state) {
    state.balance = null;
    state.networkId = null;
    state.walletAddress = null;
  },

  SET_WALLET_INFORMATION(state, payload) {
    const { balance, networkId, walletAddress } = payload;

    state.balance = balance;
    state.networkId = networkId;
    state.walletAddress = walletAddress;
  },

  SET_WALLET_ADDRESS(state, payload) {
    state.walletAddress = payload;
  },
};
