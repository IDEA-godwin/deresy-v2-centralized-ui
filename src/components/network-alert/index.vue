<template>
  <el-alert
    v-if="showAlert"
    class="connect-wallet-alert"
    :closable="false"
    effect="dark"
    type="warning"
    show-icon
  >
    <h2>Please connect your wallet to the {{ desiredNetworkName }} network.</h2>
  </el-alert>
</template>

<script>
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

import { NETWORK_IDS, NETWORK_NAMES } from "@/constants/walletConstants";

export default defineComponent({
  name: "NetworkAlert",
  components: {},
  setup() {
    const store = useStore();
    const {
      state: { user },
    } = store;

    const showAlert = computed(
      () =>
        user.networkId && NETWORK_IDS[process.env.NODE_ENV] !== user.networkId
    );

    const desiredNetworkName = NETWORK_NAMES[NETWORK_IDS[process.env.NODE_ENV]];

    return {
      showAlert,
      desiredNetworkName,
    };
  },
});
</script>
<style scoped>
.connect-wallet-alert {
  position: absolute;
  z-index: 3000;
}
</style>
