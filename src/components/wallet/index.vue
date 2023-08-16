<template>
  <div>
    <div v-if="walletAddressRef">
      <el-button
        type="primary"
        v-if="showUnlinkButton"
        @click="onUnlinkAccount"
      >
        Unlink account
      </el-button>
      <el-button type="primary" v-else @click="disconnectWallet">
        Disconnect
      </el-button>
    </div>
    <div v-else>
      <el-button type="primary" @click="onConnect" class="btn desktop"
        >Connect</el-button
      >
      <el-button type="primary" @click="onTogglePopup" class="btn mobile"
        >Connect</el-button
      >
    </div>

    <Popup class="popup-wallets" v-if="showPopup" :TogglePopup="onTogglePopup">
      <h1>Connect your wallet</h1>
      <div class="wallet-btn__content">
        <a
          v-if="!isMetamaskApp"
          class="btn wallet__btn"
          href="https://metamask.app.link/dapp/deresy.io/"
        >
          <span class="icon-link">
            <img :src="require('../../assets/icons/metamask.png')" />
          </span>
          Metamask
        </a>
        <a v-else class="btn wallet__btn" @click.prevent="onConnect">
          <span class="icon-link">
            <img :src="require('../../assets/icons/metamask.png')" />
          </span>
          Metamask
        </a>
        <br />
        <a class="btn wallet__btn" @click.prevent="onConnect">
          <span class="icon-link">
            <img :src="require('../../assets/icons/coinbase-wallet.webp')" />
          </span>
          Coinbase
        </a>
      </div>
    </Popup>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";

import web3Modal from "@/web3Modal";
import { web3WalletClient } from "@/web3";
import detectEthereumProvider from "@metamask/detect-provider";

import { getContract } from "@/services/ContractService";
import {
  DERESY_CONTRACT_ABI,
  DERESY_CONTRACT_ADDRESS,
} from "@/constants/contractConstants";

import Popup from "../../components/popup/index.vue";

import { NETWORK_NAMES } from "@/constants/walletConstants";
import {
  connectWallet,
  subscribeProvider,
  onDisconnect,
} from "@/services/ProviderService";

export default {
  name: "Wallet",
  components: {
    Popup,
  },
  setup() {
    const store = useStore();

    const {
      dispatch,
      state: { user },
    } = store;

    const owner = ref("");
    const showUnlinkButton = ref(false);
    const providerRef = ref(null);
    const balance = computed(() => user.balance);
    const walletAddress = computed(() => user.walletAddress);
    const network = computed(() => NETWORK_NAMES[user.networkId]);
    const showPopup = ref(false);
    const isMetamaskApp = ref(false);

    const walletAddressRef = ref(walletAddress);

    const onConnect = async () => {
      dispatch("setLoading", true);

      try {
        // Get provider from service
        const { provider } = await connectWallet(store);
        providerRef.value = provider;

        showUnlinkButton.value = web3Modal.cachedProvider === "custom-coinbase";

        await subscribeProvider(provider, store);

        const web3 = web3WalletClient(provider);

        const contract = await getContract(
          web3,
          DERESY_CONTRACT_ABI,
          DERESY_CONTRACT_ADDRESS
        );

        dispatch("setProvider", provider);
        dispatch("setWeb3", web3);
        dispatch("setContract", contract);
        showPopup.value = false;
      } catch (error) {
        console.error(error);
      }

      dispatch("setLoading", false);
    };

    const disconnectWallet = async () => {
      await onDisconnect(store);
    };

    const onUnlinkAccount = async () => {
      const provider = providerRef.value;
      if (typeof provider.close === "function") {
        provider.close();
        await onDisconnect(store);
      }
    };

    onMounted(async () => {
      const mmProvider = await detectEthereumProvider();
      if (web3Modal.cachedProvider) {
        await onConnect();
      }
      if (mmProvider) {
        isMetamaskApp.value = true;
      }
    });

    const onTogglePopup = () => {
      showPopup.value = !showPopup.value;
    };

    return {
      balance,
      network,
      owner,
      showUnlinkButton,
      walletAddressRef,
      onUnlinkAccount,
      onConnect,
      disconnectWallet,
      onTogglePopup,
      showPopup,
      isMetamaskApp,
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
