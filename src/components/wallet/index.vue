<template>
  <div>
    <div v-if="connected">
      <el-button type="primary" class="btn desktop" @click="disconnectWallet">
        Disconnect
      </el-button>
      <el-button type="primary" class="btn mobile" @click="disconnectWallet">
        Disconnect
      </el-button>
    </div>
    <div v-else>
      <el-button type="primary" @click="onConnect" class="btn desktop"
        >Connect Wallet</el-button
      >
      <el-button type="primary" @click="onConnect" class="btn mobile"
        >Connect Wallet</el-button
      >
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";

export default {
  name: "Wallet",
  setup() {
    const accountInfo = useAppKitAccount();

    const isConnected = computed(() => accountInfo.value.isConnected)

    const connected = ref(isConnected);
    const modal = useAppKit();

    const onConnect = async () => {
      try {
        modal.open();
      } catch (error) {
        console.error(error);
      }
    };

    const disconnectWallet = async () => {
      modal.open();
    };

    return {
      connected,
      onConnect,
      disconnectWallet,
    };
  },
};
</script>

<style>
.wallet__btn {
  width: 100%;
  padding: 16px;
  vertical-align: middle;
  text-decoration: none;
  color: #555555;
  font-weight: bold;
}

.wallet-btn__content .wallet__btn:not(:last-child) {
  border-bottom: 1px solid rgb(229, 232, 235);
}

.wallet-btn__content {
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
}

.icon-link img {
  height: 24px;
  margin-right: 16px;
  vertical-align: middle;
}

.popup-wallets .popup__inner {
  border-radius: 10px;
}
@media only screen and (max-width: 767px) {
  .btn.desktop {
    display: none;
  }
}
@media only screen and (min-width: 768px) {
  .btn.mobile {
    display: none;
  }
}
</style>
