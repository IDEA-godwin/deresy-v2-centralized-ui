<template>
  <div class="app-container" v-loading="loading">
    <Layout v-if="!loading">
      <router-view />
    </Layout>
  </div>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import Layout from "./components/layout/index.vue";
import { useStore } from "vuex";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/vue";
import { web3WalletClient } from "@/web3";
import { getUserInformation } from "@/services/WalletService";
import { NETWORK_IDS } from "@/constants/walletConstants";
import { getContract } from "@/services/ContractService";
import {
  DERESY_CONTRACT_ABI,
  DERESY_CONTRACT_ADDRESS,
} from "@/constants/contractConstants";

export default {
  name: "App",
  components: {
    Layout,
  },

  setup() {
    const store = useStore();
    const { dispatch } = store;

    const loading = ref(false);

    const projectId = "ac427b8faf6815fd4b19e685294a6c7c";

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
      name: "StudioUno",
      description: "One Studio for all",
      url: "https://studiouno-staging.web.app/",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    const chains = [
      process.env.NODE_ENV === "production" ? mainnet : sepoliaOptimism,
    ];

    const ethersConfig = defaultConfig({
      metadata,
      rpcUrl: "...",
      defaultChainId: 1,
    });

    onBeforeMount(async () => {
      const modal = createWeb3Modal({
        ethersConfig,
        chains: chains,
        projectId,
        enableWalletFeatures: false,
        enableOnramp: false,
        themeMode: "light",
        allWallets: "HIDE",
      });

      modal.subscribeProvider(async ({ provider, isConnected, chainId }) => {
        if (isConnected) {
          if (chainId === NETWORK_IDS[process.env.NODE_ENV]) {
            const userInformation = await getUserInformation(provider);
            const web3 = web3WalletClient(provider);
            const contract = await getContract(
              web3,
              DERESY_CONTRACT_ABI,
              DERESY_CONTRACT_ADDRESS
            );
            console.log("contract", contract);
            dispatch("setProvider", provider);
            dispatch("setWeb3", web3);
            dispatch("setContract", contract);
            dispatch("setWalletInformation", userInformation);
            dispatch("setEasSchemaIDs");
          } else {
            dispatch("resetContractInformation");
          }
        }
      });
    });

    return { loading };
  },
};
</script>
<style lang="less">
.el-main {
  padding: 10px;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.app-container {
  height: 100vh;
}
</style>
