import web3Modal from "@/web3Modal";
import { getUserInformation } from "@/services/WalletService";

export const connectWallet = async (store) => {
  store.dispatch("setLoading", true);
  try {
    // console.log('connectWallet || ProviderService')
    const provider = await web3Modal.connect();
    const userInformation = await getUserInformation(provider);

    if (process.env.VUE_APP_ART_DEV_MODE === "true") {
      userInformation.whitelistedEarly = true;
      userInformation.whitelistedHolder = true;
      userInformation.whitelistedPrime = true;
    }

    store.dispatch("setWalletInformation", userInformation);
    store.dispatch("setLoading", false);
    return {
      provider,
    };
  } catch (error) {
    console.error(error);
    store.dispatch("setLoading", false);
  }
};

export const subscribeProvider = async (provider, store) => {
  // console.log('subscribeProvider || ProviderService')
  try {
    provider.on("close", () => {
      console.log("reset app");
    });

    provider.on("accountsChanged", async (accounts) => {
      if (!accounts.length) {
        await onDisconnect();
      } else {
        store.dispatch("setLoading", true);

        const information = await getUserInformation(provider);
        if (process.env.VUE_APP_ART_DEV_MODE === "true") {
          information.whitelistedEarly = true;
          information.whitelistedHolder = true;
          information.whitelistedPrime = true;
        }

        store.dispatch("setWalletInformation", information);
        store.dispatch("setLoading", false);
      }
    });

    provider.on("chainChanged", async (chainId) => {
      console.log("chainChanged", chainId);
      store.dispatch("setLoading", true);
      const information = await getUserInformation(provider);
      store.dispatch("setWalletInformation", information);
      store.dispatch("setLoading", false);
    });

    provider.on("networkChanged", async (networkId) => {
      console.log("networkChanged", networkId);
      store.dispatch("setLoading", true);
      const information = await getUserInformation(provider);
      const payload = {
        ...information,
        networkId: Number(networkId),
      };
      store.dispatch("setWalletInformation", payload);
      store.dispatch("setLoading", false);
    });
  } catch (error) {
    console.log(error);
  }
};

export const onDisconnect = async (store) => {
  store.dispatch("setLoading", true);

  try {
    console.log("onDisconnect || ProviderService");
    await web3Modal.clearCachedProvider();
    store.dispatch("resetWalletInformation");
  } catch (error) {
    console.log(error);
  }

  store.dispatch("setLoading", false);
};
