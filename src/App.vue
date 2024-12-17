<template>
  <div class="app-container" v-loading="loading">
    <Layout v-if="!loading">
      <router-view />
    </Layout>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import Layout from "./components/layout/index.vue";
import { useStore } from "vuex";
import { web3WalletClient } from "@/web3";

import { createAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/vue'
  import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { optimism, optimismGoerli } from '@reown/appkit/networks'

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

    const metadata = {
      name: "Deresy",
      description: "A DEcentralized REview SYstem on Optimism",
      url: "https://deresy.xyz/",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    createAppKit({
      adapters: [new Ethers5Adapter()],
      networks: [optimism, optimismGoerli],
      metadata,
      themeMode: 'light',
      projectId,
      features: {
        email: false, // default to true
        socials: [],
        emailShowWallets: false, // default to true
      },
    });

    const accountInfo = useAppKitAccount().value;

    const status = computed(() => accountInfo?.status)
    watch(status, async (newStatus) => {
      console.log(newStatus, accountInfo.isConnected)
      if (newStatus === "connected" && accountInfo.isConnected) {
        const { chainId } = useAppKitNetwork().value
        const { walletProvider: provider } = useAppKitProvider('eip155')
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
    })
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
