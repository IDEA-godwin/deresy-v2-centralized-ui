<template>
  <div v-loading="isFormLoading" class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Close Review Request</h1>
          <el-row>
            <el-col :span="22">
              <el-form-item label="Review Request Name">
                <el-select
                  v-model="requestName"
                  placeholder="Select a review request name"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(requestName, index) in requestNames"
                    :key="index"
                    :label="requestNames[index]"
                    :value="requestNames[index]"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
    <hr class="submit-separator" />
    <el-row>
      <el-col :span="24">
        <el-tooltip
          class="box-item"
          effect="dark"
          placement="top"
          :content="submitMessage()"
          :disabled="!disableSubmit()"
        >
          <el-button
            @click="sendBtn()"
            class="send-btn"
            type="success"
            size="large"
            :disabled="!requestName || disableSubmit()"
          >
            Submit
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { closeRequest, getRequestNames } from "@/services/ContractService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";
import { useRouter } from "vue-router";
import { HOME_ROUTE } from "@/constants/routes";
import { NETWORK_IDS, NETWORK_NAMES } from "@/constants/walletConstants";

export default {
  name: "CreateReviewRequest",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;

    const wagmiConfig = computed(() => contractState.wagmiConfig);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;
    const router = useRouter();

    const requestName = ref("");
    const requestNames = ref();
    const isFormLoading = ref(false);

    const disableSubmit = () => {
      return (
        !user.networkId || NETWORK_IDS[process.env.NODE_ENV] !== user.networkId
      );
    };

    const submitMessage = () => {
      if (!user.networkId) {
        return "Please connect your wallet";
      } else if (NETWORK_IDS[process.env.NODE_ENV] !== user.networkId) {
        return `Please connect your wallet to the ${
          NETWORK_NAMES[NETWORK_IDS[process.env.NODE_ENV]]
        } network`;
      } else {
        return "";
      }
    };

    const sendBtn = async () => {
      isFormLoading.value = true;
      dispatch("setLoading", true);
      const payload = {
        requestName: requestName.value,
      };

      try {
        await closeRequest(wagmiConfig.value, payload);

        ElNotification({
          title: "Success",
          message: "Successful transaction.",
          type: "success",
          duration: notificationTime,
        });

        router.push({
          path: HOME_ROUTE,
          query: { formSuccess: "true" },
        });
      } catch (e) {
        if (e.code === 4001) {
          ElNotification({
            title: "Error",
            message: "Transaction cancelled.",
            type: "error",
            duration: notificationTime,
          });
        } else if (e.code === -32603) {
          ElNotification({
            title: "Error",
            message: "Error processing TX.",
            type: "error",
            duration: notificationTime,
          });
        } else {
          ElNotification({
            title: "Error",
            message: `Transaction failed: ${e.message}`,
            type: "error",
            duration: notificationTime,
          });
        }
      }
      dispatch("setLoading", false);
      isFormLoading.value = false;
    };

    onBeforeMount(async () => {
      if (wagmiConfig.value) {
        const payload = {
          config: wagmiConfig.value
        };
        requestNames.value = await getRequestNames(payload);
      }
    });

    watch([wagmiConfig], async () => {
      if (wagmiConfig.value) {
        const payload = {
          config: wagmiConfig.value,
        };
        requestNames.value = await getRequestNames(payload);
      }
    });

    return {
      isFormLoading,
      requestNames,
      requestName,
      disableSubmit,
      submitMessage,
      sendBtn,
    };
  },
};
</script>

<style scoped>
.form-container {
  text-align: left;
  padding: 2% 10%;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
.submit-separator {
  margin: 30px 0px 20px 0px;
  border-top: 1px solid rgb(235, 233, 233);
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
