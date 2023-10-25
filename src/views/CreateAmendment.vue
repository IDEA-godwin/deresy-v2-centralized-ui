<template>
  <div class="create-amendment-page" v-loading="loading">
    <div
      v-if="refReviewObject"
      v-loading="isFormLoading"
      class="form-container"
    >
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form label-position="top">
            <h1>Create Amendment</h1>
            <el-row :gutter="20">
              <el-col :span="24">
                <div
                  v-if="
                    Object.keys(refReviewObject).length > 0 &&
                    refReviewObject.reviewer == walletAddressRef
                  "
                  class="create-amendment-form"
                >
                  <el-col
                    :span="24"
                    class="targetHashDiv"
                    style="padding-left: 0px"
                  >
                    <strong>Request Name:</strong>
                    {{ refReviewObject.requestName }}
                  </el-col>
                  <el-col
                    :span="24"
                    class="targetHashDiv"
                    style="padding-left: 0px"
                  >
                    <strong>Hypercert:</strong>
                    {{ hypercertName }}
                  </el-col>
                  <el-col
                    :span="24"
                    class="targetHashDiv"
                    style="padding-left: 0px"
                  >
                    <strong>Referenced Attestation:</strong>
                    <a
                      :href="`${easExplorerUrl}/attestation/view/${refReviewObject.attestationID}`"
                      target="_blank"
                      >{{ refReviewObject.attestationID }}</a
                    >
                  </el-col>
                  <el-row class="amendment-row">
                    <el-col :span="24" class="targetHashDiv">
                      <el-form-item
                        :label="amendment"
                        :style="{ display: 'block' }"
                      >
                        <textarea
                          :id="'simplemde-amendment'"
                          class="textarea-markdown"
                        ></textarea>
                      </el-form-item>
                      <el-row
                        v-if="v$.amendment.$error"
                        style="margin: 0% 0% 2% 0%"
                      >
                        <el-col class="vuelidation-error">
                          {{ v$.amendment.$errors[0].$message }}
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                  <el-row class="action-row">
                    <el-col :span="24">
                      <el-button
                        @click="sendBtn()"
                        class="send-btn"
                        type="success"
                        size="large"
                        :disabled="isFormLoading"
                      >
                        Send
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
                <div v-else class="error-section">
                  <el-card class="error-card">
                    <template #header>
                      <div class="card-header">
                        <span class="error-card-title"
                          >Can't create amendment</span
                        >
                      </div>
                    </template>
                    <div class="warning custom-block">
                      {{ forbiddenMessage() }}
                    </div>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  DERESY_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ABI,
} from "@/constants/contractConstants";
import { nextTick } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { computed, ref, onBeforeMount, reactive } from "vue";
import { createAmendment } from "@/services/ContractService";
import { getGrant } from "@/services/GrantService";
import { getReviewByAttestationID } from "@/services/ReviewService";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { optimismWeb3 } from "@/web3";
export default {
  name: "Create Amendment",
  setup() {
    const route = useRoute();
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;

    const web3 = computed(() => contractState.web3);
    const walletAddress = computed(() => user.walletAddress);
    const contract = computed(() => contractState.contract);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;
    const grantID = route.params.grant_id;
    const refUID = route.params.review_id;

    const walletAddressRef = ref(walletAddress);
    const loading = ref(true);
    const isFormLoading = ref(false);
    const hypercertName = ref("");

    const refReviewObject = ref({});
    const grantObj = ref({});
    const easExplorerUrl = ref("");

    const amendmentObject = reactive({
      requestName: null,
      hypercertID: null,
      amendment: null,
      refUID: null,
    });

    easExplorerUrl.value = process.env.VUE_APP_EAS_EXPLORER_URL;

    const rules = computed(() => {
      return {
        requestName: { required },
        hypercertID: { required },
        amendment: { required },
      };
    });

    let v$ = useVuelidate(rules, amendmentObject);

    const getHypercertName = async () => {
      const hypercertContract = new optimismWeb3.eth.Contract(
        HYPERCERT_CONTRACT_ABI,
        HYPERCERT_CONTRACT_ADDRESS,
        {
          from: walletAddress.value,
        }
      );
      const uri = await hypercertContract.methods
        .uri(refReviewObject.value.hypercertID.toString())
        .call();
      if (uri) {
        const sanitizedUri = uri.replace(/^ipfs:\/\//, "");
        const data = await (
          await fetch(`https://ipfs.io/ipfs/${sanitizedUri}`)
        ).json();
        return `${data.name} (ID: ${refReviewObject.value.hypercertID})`;
      } else {
        return `Name unavailable  (ID: ${refReviewObject.value.hypercertID})`;
      }
    };

    const forbiddenMessage = () => {
      if (!refReviewObject?.value?.reviewer == walletAddressRef.value) {
        return `Your address (${walletAddressRef.value}) is not authorized to create an amendment for this review.`;
      }
    };

    const simpleMDEInitializer = async () => {
      await nextTick();

      const textArea = document.getElementById("simplemde-amendment");
      const SimpleMDE = window.SimpleMDE;
      const simplemde = new SimpleMDE({ element: textArea, forceSync: true });
      simplemde.codemirror.on("change", function () {
        amendmentObject.amendment = simplemde.value();
      });
    };

    const sendBtn = async () => {
      isFormLoading.value = true;
      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);
        const payload = {
          name: refReviewObject.value.requestName,
          amendment: amendmentObject.amendment,
          hypercertID: refReviewObject.value.hypercertID,
          attachmentsIpfsHashes: [], //TODO: add attachments
          refUID: refUID,
          contractAddress: DERESY_CONTRACT_ADDRESS,
          walletAddress: walletAddress.value,
        };

        try {
          await createAmendment(web3.value, contract.value, payload);

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
      }
      isFormLoading.value = false;
    };

    onBeforeMount(async () => {
      amendmentObject.requestName = null;
      amendmentObject.hypercertID = null;
      amendmentObject.amendment = null;
      amendmentObject.refUID = null;

      refReviewObject.value = null;
      grantObj.value = (await getGrant(grantID)).response;
      refReviewObject.value = (
        await getReviewByAttestationID(grantObj.value.request_names, refUID)
      ).response;
      amendmentObject.requestName = refReviewObject.value.requestName;
      amendmentObject.hypercertID = refReviewObject.value.hypercertID;
      amendmentObject.refUID = refUID;
      await simpleMDEInitializer();
      hypercertName.value = await getHypercertName();
      loading.value = false;
    });

    return {
      hypercertName,
      loading,
      isFormLoading,
      refReviewObject,
      walletAddressRef,
      easExplorerUrl,
      forbiddenMessage,
      sendBtn,
      v$,
    };
  },
};
</script>

<style scoped>
.selection-container {
  display: flex;
  width: 100%;
}

.create-amendment-form {
  display: flex;
  flex-direction: column;
  width: 90%;
}
.amendment-row {
  margin-top: 10px;
}
.action-row {
  margin-top: 5px;
  display: flex;
  justify-content: center;
}
.create-amendment-page {
  height: 100%;
}
.form-container {
  text-align: left !important;
  padding: 2% 10%;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
.targetHashDiv {
  font-size: 14px;
  text-align: left;
  margin-bottom: 15px;
}
.error-card {
  font-size: 15px;
  text-align: left;
}
.error-card-title {
  font-size: 20px;
  font-weight: bold;
}
.custom-block.warning {
  padding: 8px 16px;
  background-color: rgba(var(--el-color-danger-rgb), 0.1);
  border-radius: 4px;
  border-left: 5px solid var(--el-color-danger);
  margin: 20px 0;
}
.vuelidation-error {
  color: #dd0c0c;
  font-size: 12px;
  font-weight: bolder;
  float: left;
  margin-bottom: 5px;
  text-align: left;
}
@media (max-width: 768px) {
  .create-amendment-form {
    width: 100%;
  }
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
.el-form-item__content {
  display: block !important;
}
.textarea-markdown {
  text-align: left !important;
}
</style>
