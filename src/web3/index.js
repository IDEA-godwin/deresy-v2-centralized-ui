import Web3 from "web3";

export const web3InfuraClient = () => {
  const provider = `${process.env.VUE_APP_INFURA_BASE_URL}/${process.env.VUE_APP_INFURA_API_KEY}`;
  return new Web3(provider);
};

export const optimismWeb3 = new Web3(
  "https://optimism-mainnet.infura.io/v3/93cf3e10ca0044cdad4ac63eecdc04fc"
);

export const web3WalletClient = (provider) => {
  const web3 = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });
  return web3;
};
