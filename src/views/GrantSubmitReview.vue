<template>
  <el-row class="header-row">
    <el-col>
      <span class="home-title">SUBMIT REVIEW</span><br />
      <span class="home-subtitle">{{ state.grantData.title }}</span>
    </el-col>
  </el-row>
  <hr />
  <div v-loading="loading" class="main-container">
    <div v-if="!loading">
      <div v-if="!grantNotFound">
        <el-row>
          <el-col class="form-container">
            <el-form label-position="top">
              <div
                v-if="
                  !state.reviewRequest?.isClosed &&
                  state.reviewRequest?.reviewers?.includes(walletAddressRef)
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
                        v-for="(o, index) in state.reviewRequest.targets"
                        :key="index"
                        :label="state.reviewRequest.targets[index]"
                        :value="index"
                      />
                    </el-select>
                    <span
                      class="vuelidation-error"
                      v-if="v$.targetIndex.$error"
                    >
                      {{ v$.targetIndex.$errors[0].$message }}
                    </span>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  v-if="targetSelected()"
                  class="targetHashDiv"
                >
                  <span>Target IPFS Hash: </span>
                  <a
                    :href="`https://ipfs.io/ipfs/${
                      state.reviewRequest.targetsIPFSHashes[
                        reviewObject.targetIndex
                      ]
                    }`"
                    style="text-decoration: none; margin-top: 5px"
                    target="_blank"
                  >
                    {{
                      state.reviewRequest.targetsIPFSHashes[
                        reviewObject.targetIndex
                      ]
                    }}
                  </a>
                  <br /><br />
                </el-col>
                <el-col
                  :span="24"
                  v-for="(question, index) in state.reviewForm.questions"
                  :key="index"
                >
                  <el-form-item :label="question">
                    <el-input
                      v-if="state.reviewForm.types[index] == '0'"
                      style="margin-top: 5px; width: 100%"
                      v-model="reviewObject.reviews[index].answer"
                      type="text"
                      placeholder="Enter your answer"
                    />
                    <el-radio-group
                      v-if="state.reviewForm.types[index] == '1'"
                      v-model="reviewObject.reviews[index].answer"
                      size="large"
                    >
                      <el-radio-button label="Yes" />
                      <el-radio-button label="No" />
                    </el-radio-group>
                    <el-radio-group
                      v-if="state.reviewForm.types[index] == '2'"
                      v-model="reviewObject.reviews[index].answer"
                      size="large"
                    >
                      <el-radio-button
                        v-for="(questionChoices, choiceIndex) in state
                          .reviewForm.choices[index].choices"
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
                <el-row>
                  <el-col :span="24">
                    <el-button
                      @click="sendBtn()"
                      class="send-btn"
                      type="primary"
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
            </el-form>
          </el-col>
        </el-row>
      </div>
      <div v-else>
        <el-result
          icon="warning"
          title="404"
          sub-title="We're sorry, we couldn't find that grant, please try again."
        >
          <template #extra>
            <el-link href="/grants" :underline="false">
              <el-button type="primary" size="large">Explore Grants</el-button>
            </el-link>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script>
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import { useRoute } from "vue-router";
import { getReviewRequest } from "@/services/ReviewRequestService";
import { getReviewForm } from "@/services/ReviewFormService";
import { getGrant } from "@/services/GrantService";
import { submitReview } from "@/services/ContractService";
import { useStore } from "vuex";
import { computed, ref, onBeforeMount, reactive } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
export default {
  name: "GrantSubmitReview",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;
    const route = useRoute();
    const loading = ref(true);
    const web3 = computed(() => contractState.web3);
    const walletAddress = computed(() => user.walletAddress);
    const contract = computed(() => contractState.contract);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;
    //const contractRef = ref(contract);
    const walletAddressRef = ref(walletAddress);
    const grantID = route.params.grant_id;
    const grantNotFound = ref(true);
    const state = reactive({
      grantData: {},
      reviewRequest: {},
      reviewForm: {},
    });

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
      if (state.reviewRequest.isClosed) {
        return "This request is closed and does no longer accept reviews.";
      } else if (!state.reviewRequest?.reviewers?.includes(walletAddressRef)) {
        return `Your address (${walletAddressRef.value}) is not authorized to submit a review for this request.`;
      }
    };

    const targetSelected = () => {
      return reviewObject.targetIndex != null;
    };

    const sendBtn = async () => {
      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);
        const reviewsAnswers = reviewObject.reviews.map((review) => {
          return review.answer;
        });
        console.log(reviewsAnswers);
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
      loading.value = true;
      const grantResponse = await getGrant(grantID);
      if (grantResponse.response) {
        grantNotFound.value = false;
        state.grantData = grantResponse.response;
        reviewObject.requestName = state.grantData.request_name;
        const reviewRequestResponse = await getReviewRequest(
          state.grantData.request_name
        );
        state.reviewRequest = reviewRequestResponse.response;
        const reviewFormResponse = await getReviewForm(
          state.reviewRequest.reviewFormIndex
        );
        state.reviewForm = reviewFormResponse.response;

        reviewObject.reviews = [];
        for (let i = 0; i < state.reviewForm.questions.length; i++) {
          reviewObject.reviews.push({ answer: "" });
        }
      }
      loading.value = false;
    });

    return {
      loading,
      walletAddressRef,
      reviewObject,
      state,
      grantNotFound,
      targetSelected,
      forbiddenMessage,
      sendBtn,
      v$,
    };
  },
};
</script>

<style scoped>
.form-container {
  width: 100%;
  text-align: left;
}

.main-container {
  padding: 5% 10%;
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
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
  border-radius: 4px;
  border-left: 5px solid var(--el-color-primary);
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
.header-row {
  padding: 7%;
  background-color: #f4f1fa;
  margin: 0;
}
.header-row::before {
  content: "";
  background-image: url("../assets/images/gitcoin-bg.svg");
  background-position: 70% 30%;
  background-size: contain;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  opacity: 0.15;
}
.home-title {
  font-weight: bolder;
  font-size: 40px;
  text-align: center;
  margin: 3% 0;
  color: #6610f2;
  position: relative;
  text-shadow: 1px 1px #6f6d6d60;
}
.home-subtitle {
  font-size: 24px;
  text-align: center;
  margin: 1% 0;
  color: #545454;
  position: relative;
  font-weight: bolder;
}
hr {
  border-top: 5px solid #6610f2;
  margin: 0;
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
