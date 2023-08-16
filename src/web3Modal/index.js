import Web3Modal from "web3modal";
import WalletLink from "walletlink";

const coinbase = {
  display: {
    name: "Coinbase",
    description: "Scan with WalletLink to connect",
  },
  options: {
    appName: "app",
    networkUrl: `${process.env.VUE_APP_INFURA_BASE_URL}/${process.env.VUE_APP_INFURA_API_KEY}`,
  },
  package: WalletLink,
  connector: async (_, options) => {
    const { appName, networkUrl, chainId } = options;
    const walletLink = new WalletLink({
      appName,
    });
    const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
    await provider.enable();
    return provider;
  },
};

const providerOptions = {
  "custom-coinbase": coinbase,
};

export default new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions,
});
