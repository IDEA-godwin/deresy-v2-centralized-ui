import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/vue";

const projectId = process.env.VUE_APP_WEB3MODAL_PROJECT_ID;

const chain = {
  chainId: process.env.VUE_APP_CHAIN_ID,
  name: process.env.VUE_APP_NETWORK_NAME,
  currency: process.env.VUE_APP_NETWORK_CURRENCY,
  explorerUrl: process.env.VUE_APP_NETWORK_EXPLORER_URL,
  rpcUrl: `${process.env.VUE_APP_INFURA_BASE_URL}/${process.env.VUE_APP_INFURA_API_KEY}`,
};

const metadata = {
  name: "Deresy",
  description: "A DEcentralized REview SYstem on Optimism",
  url: "https://deresy.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const ethersConfig = defaultConfig({
  metadata,
  rpcUrl: `${process.env.VUE_APP_INFURA_BASE_URL}/${process.env.VUE_APP_INFURA_API_KEY}`,
  defaultChainId: process.env.VUE_APP_CHAIN_ID,
});

const modal = createWeb3Modal({
  ethersConfig,
  chains: [chain],
  projectId,
  enableWalletFeatures: false,
  enableOnramp: false,
  themeMode: "light",
  allWallets: "HIDE",
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    "e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b",
  ],
});

export default modal;
