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
      rpcUrl: "...",
      defaultChainId: 1,
    });

    onBeforeMount(async () => {
      const modal = createWeb3Modal({
        ethersConfig,
        chains: [chain],
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
