import { web3WalletClient } from "@/web3";

export const getUserInformation = async (provider) => {
  const web3 = web3WalletClient(provider);
  const { eth, utils } = web3;

  const accounts = await eth.getAccounts();
  const address = accounts[0];
  const networkId = await eth.net.getId();
  const balanceInWei = await eth.getBalance(address);
  let balance = utils.fromWei(balanceInWei);
  balance = Math.round((Number(balance) + Number.EPSILON) * 100) / 100;

  return {
    balance,
    networkId,
    walletAddress: address,
  };
};
