<template>
  <div class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Close Review Request</h1>
          <el-row>
            <el-col :span="24">
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
    <el-row>
      <el-col :span="24">
        <el-button
          @click="sendBtn()"
          class="send-btn"
          type="success"
          size="large"
          :disabled="!requestName"
        >
          Send
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import { closeRequest, getRequestNames } from "@/services/ContractService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";
export default {
  name: "CreateReviewRequest",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;

    const web3 = computed(() => contractState.web3);
    const walletAddress = computed(() => user.walletAddress);
    const contract = computed(() => contractState.contract);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

    const requestName = ref("");
    const requestNames = ref();
    const contractRef = ref(contract);

    const sendBtn = async () => {
      dispatch("setLoading", true);
      const payload = {
        requestName: requestName.value,
        contractAddress: DERESY_CONTRACT_ADDRESS,
        walletAddress: walletAddress.value,
      };

      try {
        await closeRequest(web3.value, contract.value, payload);

        ElNotification({
          title: "Success",
          message: "Successful transaction.",
          type: "success",
          duration: notificationTime,
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
    };

    onBeforeMount(async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        requestNames.value = await getRequestNames(payload);
      }
    });

    watch([contractRef], async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        requestNames.value = await getRequestNames(payload);
      }
    });

    return {
      requestNames,
      requestName,
      sendBtn,
    };
  },
};
</script>

<style scoped>
.form-container {
  padding: 2% 5%;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
