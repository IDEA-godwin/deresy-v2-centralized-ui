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

import { createAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/vue';
import { useConfig } from '@wagmi/vue'
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

    dispatch("setLoading", true)

    const loading = ref(false);
    const wagmiAdapter = getWagmiAdapter();

    try {
      createAppKit({
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
      console.log(e)
    }

    const config = useConfig();
    const accountInfo = useAppKitAccount().value;

    const status = computed(() => accountInfo?.status)
    watch(status, async (newStatus) => {
      console.log(process.env.NODE_ENV)
      console.log(newStatus)
      if (newStatus === "connected" && accountInfo.isConnected) {
        const { chainId } = useAppKitNetwork().value;
        if (chainId === NETWORK_IDS[process.env.NODE_ENV]) {
          const {
            reviewsSchemaID,
            amendmentsSchemaID
          } = await getEasSchemaIds(config);
          console.log(reviewsSchemaID, amendmentsSchemaID);
          dispatch("setWalletInformation", {walletAddress: accountInfo?.address, networkId: chainId, balance: null})
          dispatch("setWagmiConfig", config);
          dispatch("setEasSchemaIDs", { reviewsSchemaID, amendmentsSchemaID });
          dispatch("setLoading", false);
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
