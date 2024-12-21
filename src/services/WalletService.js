// import { web3WalletClient } from "@/web3";

import { getBalance } from '@wagmi'

export const getUserInformation = async (provider) => {
  const balance = getBalance()
  // const web3 = web3WalletClient(provider);
  // const { eth, utils } = web3;

  // const accounts = await eth.getAccounts();
  // const address = accounts[0];
  // const networkId = Number(await eth.net.getId());
  // const balanceInWei = await eth.getBalance(address);
  // let balance = utils.fromWei(balanceInWei.toString(), "ether");
  // balance = Math.round((Number(balance) + Number.EPSILON) * 100) / 100;

  return {
    balance,
    networkId,
    walletAddress: address,
  };
};
