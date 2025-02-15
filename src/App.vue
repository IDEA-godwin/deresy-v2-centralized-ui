<template>
  <div class="app-container" v-loading="loading">
    <Layout v-if="!loading">
      <router-view />
    </Layout>
  </div>
</template>

<script>
import { ref, watch, computed, onBeforeMount } from "vue";
import Layout from "./components/layout/index.vue";
import { useStore } from "vuex";

import { createAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/vue';
import { NETWORK_IDS } from "@/constants/walletConstants";
import { getEasSchemaIds } from "./services/ContractService";
import { getWagmiAdapter, networks, projectId, metadata } from "./utils/config";

export default {
  name: "App",
  components: {
    Layout,
  },

  setup() {
    const store = useStore();
    const { dispatch } = store;

    dispatch("setLoading", true);

    const loading = ref(false);
    let modalKit;
    const wagmiAdapter = getWagmiAdapter();

    onBeforeMount(async () => {
      try {
        modalKit = createAppKit({
          adapters: [wagmiAdapter],
          networks,
          metadata,
          themeMode: 'light',
          projectId,
          features: {
            email: false, // default to true
            socials: [],
            emailShowWallets: false, // default to true
          },
        });
      } catch (e) {
        dispatch("setLoading", false);
        dispatch("resetContractInformation");
        dispatch("resetWalletInformation");
        console.log(e);
      }
    });

    const accountInfo = useAppKitAccount().value;
    const network = useAppKitNetwork().value;

    const status = computed(() => accountInfo?.status);
    const chainId = computed(() => network?.chainId);

    watch(status, async (newStatus) => {
      const config = modalKit?.chainAdapters['eip155'].wagmiConfig;
      console.log(status.value, newStatus);
      console.log(modalKit, config)

      if (newStatus === "connected" && accountInfo.isConnected) {
        console.log(chainId.value, config?.state.chainId)
        if (NETWORK_IDS[process.env.NODE_ENV].includes(chainId.value)) {
          const {
            reviewsSchemaID,
            amendmentsSchemaID
          } = await getEasSchemaIds(config);
          dispatch("setWalletInformation", { walletAddress: accountInfo?.address, networkId: chainId.value, balance: null });
          dispatch("setWagmiConfig", config);
          dispatch("setEasSchemaIDs", { reviewsSchemaID, amendmentsSchemaID });
          dispatch("setLoading", false);
        } else {
          dispatch("resetContractInformation");
          modalKit.disconnect();
        }
      }
    })


    watch(chainId, async (newChainId) => {
      const config = modalKit?.chainAdapters['eip155'].wagmiConfig;
      console.log(newChainId, config?.state.chainId);

      if (accountInfo.isConnected) {
        if (NETWORK_IDS[process.env.NODE_ENV].includes(newChainId)) {
          const {
            reviewsSchemaID,
            amendmentsSchemaID
          } = await getEasSchemaIds(config);
          dispatch("setWalletInformation", { walletAddress: accountInfo?.address, networkId: newChainId, balance: null })
          dispatch("setWagmiConfig", config);
          dispatch("setEasSchemaIDs", { reviewsSchemaID, amendmentsSchemaID });
          dispatch("setLoading", false);
        } else {
          dispatch("resetContractInformation");
          modalKit.disconnect();
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
