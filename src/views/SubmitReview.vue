<template>
  <div class="submit-review-page" v-loading="loading">
    <div
      v-if="requestObject && reviewObject && reviewForm"
      v-loading="isFormLoading"
      class="form-container"
    >
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form label-position="top">
            <h1>Submit Review</h1>
            <el-row>
              <el-col :span="18">
                <el-col :span="24" class="targetHashDiv">
                  <strong>Review Request Name:</strong>
                  {{ requestObject.requestName }}
                </el-col>
              </el-col>
              <el-col :span="6"> </el-col>
            </el-row>
            <el-row :gutter="20" v-if="requestObject && reviewForm">
              <div
                v-if="
                  !requestObject.isClosed &&
                  requestObject.reviewers.includes(walletAddressRef) &&
                  !grantReviews.some((r) => r.reviewer == walletAddressRef)
                "
                class="submitReviewFormContainer"
              >
                <el-col :span="24" class="targetHashDiv">
                  <strong>Hypercert:</strong>
                  {{ hypercertName }}
                </el-col>

                <el-col
                  :span="24"
                  v-if="
                    requestObject.targetsIPFSHashes[reviewObject.targetIndex]
                  "
                  class="targetHashDiv"
                >
                  <strong>Hypercert:</strong>
                  <a
                    :href="`https://ipfs.io/ipfs/${
                      requestObject.targetsIPFSHashes[reviewObject.targetIndex]
                    }`"
                    style="text-decoration: none; margin-wtop: 5px"
                    target="_blank"
                  >
                    {{
                      requestObject.targetsIPFSHashes[reviewObject.targetIndex]
                    }}
                  </a>
                  <br /><br />
                </el-col>
                <el-row
                  v-if="reviewObject.reviews && reviewObject.reviews.length > 0"
                >
                  <el-col
                    :span="24"
                    v-for="(question, index) in reviewForm.questions"
                    :key="index"
                  >
                    <el-form-item
                      :label="question"
                      :style="{ display: 'block' }"
                    >
                      <textarea
                        v-if="reviewForm.types[index] == '0'"
                        :id="'simplemde-' + index"
                        class="textarea-markdown"
                      ></textarea>

                      <el-radio-group
                        v-if="reviewForm.types[index] == '1'"
                        v-model="reviewObject.reviews[index].answer"
                        size="large"
                      >
                        <el-radio-button label="Yes" />
                        <el-radio-button label="No" />
                      </el-radio-group>
                      <el-radio-group
                        v-if="reviewForm.types[index] == '2'"
                        v-model="reviewObject.reviews[index].answer"
                        size="large"
                      >
                        <el-radio-button
                          v-for="(questionChoices, choiceIndex) in reviewForm
                            .choices[index].choices"
                          :key="choiceIndex"
                          :label="questionChoices"
                        />
                      </el-radio-group>
                    </el-form-item>
                    <el-row
                      v-if="v$.reviews.$error"
                      style="margin: 0% 0% 2% 0%"
                    >
                      <el-col class="vuelidation-error">
                        {{ v$.reviews.$errors[0].$message[index][0] }}
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
                <el-row v-if="reviewObject.requestName">
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
  </div>
</template>

<script>
import { nextTick } from "vue";
import { useRoute } from "vue-router";
import {
  DERESY_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ABI,
} from "@/constants/contractConstants";
import { getRequestNames, submitReview } from "@/services/ContractService";
import { getGrant } from "@/services/GrantService";
import { getReviewRequest } from "@/services/ReviewRequestService";
import { getReviewForm } from "@/services/ReviewFormService";
import { getReviews } from "@/services/ReviewService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount, reactive } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { optimismWeb3 } from "@/web3";

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

    const route = useRoute();
    const grantID = route.params.grant_id;

    const requestNames = ref();
    const contractRef = ref(contract);
    const walletAddressRef = ref(walletAddress);
    const requestObject = ref();
    const reviewForm = ref({});
    const grantObj = ref({});
    const ipfsHashes = ref([]);
    const simpleMDEInstances = ref([]);
    const hypercertName = ref("");
    const grantReviews = ref([]);
    const loading = ref(true);
    const isFormLoading = ref(false);

    const reviewObject = reactive({
      requestName: "",
      hypercertID: null,
      reviews: [],
    });

    const rules = computed(() => {
      return {
        requestName: { required },
        hypercertID: { required },
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

    const getHypercertName = async () => {
      const hypercertContract = new optimismWeb3.eth.Contract(
        HYPERCERT_CONTRACT_ABI,
        HYPERCERT_CONTRACT_ADDRESS,
        {
          from: walletAddress.value,
        }
      );
      const uri = await hypercertContract.methods
        .uri(grantObj.value.hypercertID.toString())
        .call();
      if (uri) {
        const data = await (await fetch(`https://ipfs.io/ipfs/${uri}`)).json();
        return data.name;
      } else {
        return "Name unavailable";
      }
    };

    const forbiddenMessage = () => {
      if (requestObject.value.isClosed) {
        return "This request is closed and does no longer accept reviews.";
      } else if (
        !requestObject.value.reviewers.includes(walletAddressRef.value)
      ) {
        console.log(requestObject.value.reviewers, walletAddressRef.value);
        return `Your address (${walletAddressRef.value}) is not authorized to submit a review for this request.`;
      } else if (
        grantReviews.value.some((r) => r.reviewer == walletAddressRef.value)
      ) {
        return `This address (${walletAddressRef.value}) has already submitted a review for the Hypercert ID of this grant.`;
      }
    };

    const allowToSubmit = () => {
      return (
        reviewObject.requestName &&
        reviewObject.targetIndex &&
        reviewObject.reviews.length == reviewForm.value.questions.length &&
        !reviewObject.reviews.includes(undefined)
      );
    };

    const isEmptyHashes = () => {
      return ipfsHashes.value.every((hash) => hash === "");
    };

    const simpleMDEInitializer = async () => {
      await nextTick();

      const textAreas = document.getElementsByClassName("textarea-markdown");
      for (let textArea of textAreas) {
        const index = parseInt(textArea.id.replace("simplemde-", ""), 10);
        const SimpleMDE = window.SimpleMDE;
        const simplemde = new SimpleMDE({ element: textArea, forceSync: true });
        simpleMDEInstances.value.push(simplemde);

        const parentContent = textArea.closest(".el-form-item__content");
        if (parentContent) {
          parentContent.style.display = "block";
        }

        simplemde.codemirror.on("change", function () {
          reviewObject.reviews[index].answer = simplemde.value();
        });
      }
    };
    const sendBtn = async () => {
      isFormLoading.value = true;

      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);

        const reviewsAnswers = reviewObject.reviews.map((review) => {
          return review.answer;
        });

        const payload = {
          name: reviewObject.requestName,
          answers: reviewsAnswers,
          grantID: grantID,
          hypercertID: reviewObject.hypercertID,
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
      isFormLoading.value = false;
    };

    onBeforeMount(async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        requestNames.value = await getRequestNames(payload);
      }

      reviewObject.targetIndex = null;
      requestObject.value = null;
      reviewForm.value = null;

      grantObj.value = (await getGrant(grantID)).response;
      requestObject.value = (
        await getReviewRequest(grantObj.value.request_name)
      ).response;
      reviewObject.requestName = grantObj.value.request_name;
      reviewObject.hypercertID = grantObj.value.hypercertID;
      console.log(reviewObject);
      reviewForm.value = (
        await getReviewForm(requestObject.value.reviewFormIndex)
      ).response;
      simpleMDEInstances.value.forEach((instance) => instance.toTextArea());
      simpleMDEInstances.value = [];

      ipfsHashes.value = requestObject.value.targetsIPFSHashes;

      reviewObject.reviews = [];
      for (let i = 0; i < reviewForm.value.questions.length; i++) {
        reviewObject.reviews.push({ answer: "" });
      }
      grantReviews.value = (
        await getReviews(requestObject.value.requestName)
      ).response.reviews.filter(
        (r) => r.hypercertID == grantObj.value.hypercertID
      );
      hypercertName.value = await getHypercertName();

      await simpleMDEInitializer();
      loading.value = false;
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
      grantObj,
      grantReviews,
      requestNames,
      hypercertName,
      ipfsHashes,
      loading,
      isFormLoading,
      simpleMDEInstances,
      requestObject,
      reviewForm,
      isEmptyHashes,
      forbiddenMessage,
      allowToSubmit,
      sendBtn,
      v$,
    };
  },
};
</script>

<style scoped>
.submit-review-page {
  height: 100%;
}
.form-container {
  text-align: left !important;
  padding: 2% 5%;
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
.submitReviewFormContainer {
  width: 65%;
}
@media (max-width: 768px) {
  .submitReviewFormContainer {
    width: 100%;
  }
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
.textarea-markdown {
  text-align: left !important;
}
</style>
