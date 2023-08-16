<template>
  <div class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Submit Review</h1>
          <el-row :gutter="20">
            <el-col :span="18">
              <el-form-item label="Review Request Name">
                <el-select
                  v-model="reviewObject.requestName"
                  placeholder="Select a review request name"
                  size="large"
                  style="width: 100%"
                  @change="onRequestSelection()"
                >
                  <el-option
                    v-for="(requestName, index) in requestNames"
                    :key="index"
                    :label="requestNames[index]"
                    :value="requestNames[index]"
                  />
                </el-select>
                <span class="vuelidation-error" v-if="v$.requestName.$error">
                  {{ v$.requestName.$errors[0].$message }}
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-button
                @click="getFormBtn()"
                class="send-btn"
                type="primary"
                style="margin-top: 30px"
                :disabled="!reviewObject.requestName"
              >
                Get Form
              </el-button>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="requestObject && reviewForm">
            <div
              v-if="
                !requestObject.isClosed &&
                requestObject.reviewers.includes(walletAddressRef)
              "
            >
              <el-col :span="24">
                <el-form-item label="Target">
                  <el-select
                    v-model="reviewObject.targetIndex"
                    placeholder="Select the target for your review"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(o, index) in requestObject.targets"
                      :key="index"
                      :label="requestObject.targets[index]"
                      :value="index"
                    />
                  </el-select>
                  <span class="vuelidation-error" v-if="v$.targetIndex.$error">
                    {{ v$.targetIndex.$errors[0].$message }}
                  </span>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="targetSelected()" class="targetHashDiv">
                <span>Target IPFS Hash</span><br />
                <a
                  :href="`https://ipfs.io/ipfs/${
                    requestObject.targetsIPFSHashes[reviewObject.targetIndex]
                  }`"
                  style="text-decoration: none; margin-top: 5px"
                  target="_blank"
                >
                  {{
                    requestObject.targetsIPFSHashes[reviewObject.targetIndex]
                  }}
                </a>
                <br /><br />
              </el-col>
              <el-col
                :span="24"
                v-for="(question, index) in reviewForm[0]"
                :key="index"
              >
                <el-form-item :label="question">
                  <el-input
                    v-if="reviewForm[1][index] == '0'"
                    style="margin-top: 5px; width: 100%"
                    v-model="reviewObject.reviews[index].answer"
                    type="text"
                    placeholder="Enter your answer"
                  />
                  <el-radio-group
                    v-if="reviewForm[1][index] == '1'"
                    v-model="reviewObject.reviews[index].answer"
                    size="large"
                  >
                    <el-radio-button label="Yes" />
                    <el-radio-button label="No" />
                  </el-radio-group>
                  <el-radio-group
                    v-if="reviewForm[1][index] == '2'"
                    v-model="reviewObject.reviews[index].answer"
                    size="large"
                  >
                    <el-radio-button
                      v-for="(questionChoices, choiceIndex) in reviewForm[2][
                        index
                      ]"
                      :key="choiceIndex"
                      :label="questionChoices"
                    />
                  </el-radio-group>
                </el-form-item>
                <el-row v-if="v$.reviews.$error" style="margin: 0% 0% 2% 0%">
                  <el-col class="vuelidation-error">
                    {{ v$.reviews.$errors[0].$message[index][0] }}
                  </el-col>
                </el-row>
              </el-col>
              <el-row v-if="reviewObject.requestName">
                <el-col :span="24">
                  <el-button
                    @click="sendBtn()"
                    class="send-btn"
                    type="success"
                    size="large"
                  >
                    Send
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <div v-else>
              <el-card class="error-card">
                <template #header>
                  <div class="card-header">
                    <span class="error-card-title">Can't submit review</span>
                  </div>
                </template>
                <div class="warning custom-block">
                  {{ forbiddenMessage() }}
                </div>
              </el-card>
            </div>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import {
  getRequest,
  getReviewForm,
  getRequestNames,
  submitReview,
} from "@/services/ContractService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount, reactive } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
export default {
  name: "SubmitReview",
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

    const requestNames = ref();
    const contractRef = ref(contract);
    const walletAddressRef = ref(walletAddress);
    const requestObject = ref();
    const reviewForm = ref({});

    const reviewObject = reactive({
      requestName: "",
      targetIndex: null,
      reviews: [],
    });

    const rules = computed(() => {
      return {
        requestName: { required },
        targetIndex: { required },
        reviews: {
          $each: helpers.forEach({
            answer: {
              required,
            },
          }),
        },
      };
    });

    let v$ = useVuelidate(rules, reviewObject);

    const forbiddenMessage = () => {
      if (requestObject.value.isClosed) {
        return "This request is closed and does no longer accept reviews.";
      } else if (!requestObject.value.reviewers.includes(walletAddressRef)) {
        return `Your address (${walletAddressRef.value}) is not authorized to submit a review for this request.`;
      }
    };

    const allowToSubmit = () => {
      return (
        reviewObject.requestName &&
        reviewObject.targetIndex &&
        reviewObject.reviews.length == reviewForm.value[0].length &&
        !reviewObject.reviews.includes(undefined)
      );
    };

    const targetSelected = () => {
      return reviewObject.targetIndex != null;
    };

    const onRequestSelection = () => {
      reviewObject.targetIndex = null;
      requestObject.value = null;
      reviewForm.value = null;
    };

    const getFormBtn = async () => {
      const requestPayload = {
        requestName: reviewObject.requestName,
        contractMethods: contract.value.methods,
      };
      requestObject.value = await getRequest(requestPayload);

      const reviewFormPayload = {
        reviewFormIndex: requestObject.value.reviewFormIndex,
        contractMethods: contract.value.methods,
      };
      reviewForm.value = await getReviewForm(reviewFormPayload);

      reviewObject.reviews = [];
      for (let i = 0; i < reviewForm.value[0].length; i++) {
        reviewObject.reviews.push({ answer: "" });
      }
    };

    const sendBtn = async () => {
      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);
        const reviewsAnswers = reviewObject.reviews.map((review) => {
          return review.answer;
        });
        const payload = {
          name: reviewObject.requestName,
          targetIndex: reviewObject.targetIndex,
          answers: reviewsAnswers,
          contractAddress: DERESY_CONTRACT_ADDRESS,
          walletAddress: walletAddress.value,
        };

        try {
          await submitReview(web3.value, contract.value, payload);

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
      walletAddressRef,
      reviewObject,
      requestNames,
      requestObject,
      reviewForm,
      targetSelected,
      forbiddenMessage,
      allowToSubmit,
      onRequestSelection,
      getFormBtn,
      sendBtn,
      v$,
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
.targetHashDiv {
  font-size: 14px;
  text-align: left;
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
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
