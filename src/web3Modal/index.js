import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/vue";

const projectId = "4fde6394f3ee5df97de5379f838522ac";

const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://mainnet.infura.io/v3/ecadfc88173e4932b57eb5e2ba18e2e2",
};

const sepoliaOptimism = {
  chainId: 11155420,
  name: "Sepolia Optimism",
  currency: "ETH",
  explorerUrl: "https://sepolia-optimism.etherscan.io/",
  rpcUrl:
    "https://optimism-sepolia.infura.io/v3/8560cc7ba08640bab93a7edb92e7afa4",
};

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [
  process.env.NODE_ENV === "production" ? mainnet : sepoliaOptimism,
];

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
const modal = createWeb3Modal({
  ethersConfig,
  chains: chains,
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
