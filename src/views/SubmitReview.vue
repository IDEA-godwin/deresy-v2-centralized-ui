<template>
  <div class="submit-review-page" v-loading="loading">
    <div v-if="reviewRequests" v-loading="isFormLoading" class="form-container">
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form label-position="top">
            <h1>Submit Review</h1>
            <el-row :gutter="20" v-if="reviewRequests">
              <el-col :span="24" class="targetHashDiv">
                <div class="selection-container">
                  <el-button
                    @click="updateSubmitForm()"
                    class="getForm"
                    type="primary"
                    size="large"
                  >
                    Get Form
                  </el-button>

                  <el-select
                    v-model="selectedReviewRequest"
                    placeholder="Select a review request"
                    size="large"
                    class="review-select"
                  >
                    <el-option
                      v-for="item in reviewRequests"
                      :key="item.requestName"
                      :label="item.requestName"
                      :value="item.requestName"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="24">
                <div v-if="selectedReviewRequest && requestObjectReady">
                  <div
                    v-if="
                      !requestObject.isClosed &&
                      requestObject.reviewers.includes(walletAddressRef) &&
                      !hypercertReviews?.some(
                        (r) => r.reviewer == walletAddressRef
                      )
                    "
                    class="submit-review-form"
                  >
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
                      v-if="
                        requestObject.targetsIPFSHashes[
                          reviewObject.targetIndex
                        ]
                      "
                      class="targetHashDiv"
                    >
                      <strong>Hypercert:</strong>
                      <a
                        :href="`https://ipfs.io/ipfs/${
                          requestObject.targetsIPFSHashes[
                            reviewObject.targetIndex
                          ]
                        }`"
                        style="text-decoration: none; margin-wtop: 5px"
                        target="_blank"
                      >
                        {{
                          requestObject.targetsIPFSHashes[
                            reviewObject.targetIndex
                          ]
                        }}
                      </a>
                      <br /><br />
                    </el-col>
                    <el-row
                      v-if="
                        reviewObject.reviews && reviewObject.reviews.length > 0
                      "
                      class="review-row"
                    >
                      <el-col
                        :span="24"
                        v-for="(question, index) in reviewForm.questions"
                        :key="index"
                        class="targetHashDiv"
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
                              v-for="(
                                questionChoices, choiceIndex
                              ) in reviewForm.choices[index].choices"
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
                    <el-row
                      class="attachment-row"
                      v-for="(fileInfo, index) in attachedFiles"
                      :key="index"
                    >
                      <el-col :span="24" class="targetHashDiv">
                        {{ fileInfo.fileName }} IPFS HASH:
                        {{ fileInfo.ipfsHash }}
                        <el-button
                          class="delete-attachment-row"
                          type="danger"
                          :icon="CloseBold"
                          size="small"
                          circle
                          @click="removeAttachment(index)"
                          >x</el-button
                        >
                      </el-col>
                    </el-row>
                    <el-row
                      v-if="
                        reviewObject.requestName && attachedFiles.length < 3
                      "
                    >
                      <el-col :span="24">
                        <el-upload
                          ref="upload"
                          action="#"
                          :show-file-list="false"
                          :before-upload="() => false"
                          @change="handleFileChange"
                        >
                          <el-button
                            class="getForm"
                            type="primary"
                            size="medium"
                            >Add Attachment</el-button
                          >
                        </el-upload>
                      </el-col>
                    </el-row>
                    <el-row v-if="reviewObject.requestName" class="action-row">
                      <el-col :span="24">
                        <el-button
                          @click="sendBtn()"
                          class="send-btn"
                          type="success"
                          size="large"
                          :disabled="isFormLoading"
                        >
                          Submit
                        </el-button>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else class="error-section">
                    <el-card class="error-card">
                      <template #header>
                        <div class="card-header">
                          <span class="error-card-title"
                            >Can't submit review</span
                          >
                        </div>
                      </template>
                      <div class="warning custom-block">
                        {{ forbiddenMessage() }}
                      </div>
                    </el-card>
                  </div>
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
import { nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  DERESY_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ABI,
} from "@/constants/contractConstants";
import {
  filterReviewRequests,
  getMatchingReview,
  populateAnswers,
} from "@/helpers/ReviewsHelper";
import { getRequestNames, submitReview } from "@/services/ContractService";
import { getHypercert } from "@/services/HypercertService";
import {
  getReviewRequest,
  getReviewRequestsByHypercert,
} from "@/services/ReviewRequestService";
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

    const router = useRouter();
    const route = useRoute();
    const tokenID = route.params.token_id;

    const reviewRequests = ref([]);
    const selectedReviewRequest = ref(null);
    const requestObjectReady = ref(false);
    const requestNames = ref();
    const contractRef = ref(contract);
    const walletAddressRef = ref(walletAddress);
    const requestObject = ref();
    const reviewForm = ref({});
    const hypercertObj = ref({});
    const ipfsHashes = ref([]);
    const simpleMDEInstances = ref([]);
    const hypercertName = ref("");
    const hypercertReviews = ref([]);
    const loading = ref(true);
    const isFormLoading = ref(false);
    const attachedFiles = ref([]);

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
      const uri = await hypercertContract.methods.uri(tokenID).call();
      if (uri) {
        const sanitizedUri = uri.replace(/^ipfs:\/\//, "");
        const data = await (
          await fetch(`https://ipfs.io/ipfs/${sanitizedUri}`)
        ).json();
        return `${data.name} (ID: ${tokenID})`;
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
        return `Your address (${walletAddressRef.value}) is not authorized to submit a review for this request.`;
      } else if (
        hypercertReviews.value.some((r) => r.reviewer == walletAddressRef.value)
      ) {
        return `This address (${walletAddressRef.value}) has already submitted a review for this Request and Hypercert.`;
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

    const loadPastAnswers = async (
      reviewFormName,
      reviewRequests,
      hypercertID,
      requestName,
      types
    ) => {
      const filteredRequests = filterReviewRequests(
        reviewRequests,
        hypercertID,
        reviewFormName,
        walletAddress,
        requestName
      );

      if (filteredRequests.length == 0) {
        return;
      }

      const review = await getMatchingReview(
        filteredRequests,
        walletAddress,
        reviewFormName
      );

      if (!review) {
        return;
      }

      populateAnswers(review, types, reviewObject);

      return;
    };

    const sendBtn = async () => {
      isFormLoading.value = true;

      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);

        const reviewsAnswers = reviewObject.reviews.map((review) => {
          return review.answer;
        });

        const attachmentsIpfsHashes = attachedFiles.value.map(
          (file) => file.ipfsHash
        );

        const payload = {
          name: reviewObject.requestName,
          answers: reviewsAnswers,
          tokenID: tokenID,
          hypercertID: reviewObject.hypercertID,
          contractAddress: DERESY_CONTRACT_ADDRESS,
          attachmentsIpfsHashes: attachmentsIpfsHashes,
          walletAddress: walletAddress.value,
        };

        try {
          ElNotification({
            title: "Info",
            message: "Submitting data you will be asked to sign in a moment.",
            type: "info",
            duration: 8000,
          });
          await submitReview(web3.value, contract.value, payload);

          ElNotification({
            title: "Success",
            message: "Successful transaction.",
            type: "success",
            duration: notificationTime,
          });

          router.push({
            path: `/hypercerts/${tokenID}`,
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

      hypercertObj.value = (await getHypercert(tokenID)).response;
      reviewRequests.value = (
        await getReviewRequestsByHypercert(tokenID)
      ).response;

      loading.value = false;
    });

    const updateSubmitForm = async () => {
      if (selectedReviewRequest.value == null) {
        return;
      }

      requestObjectReady.value = false;
      loading.value = true;

      requestObject.value = (
        await getReviewRequest(selectedReviewRequest.value)
      ).response;

      reviewObject.requestName = selectedReviewRequest.value;
      reviewObject.hypercertID = tokenID;

      reviewForm.value = (
        await getReviewForm(requestObject.value.reviewFormName)
      ).response;

      console.log(reviewForm)
      simpleMDEInstances.value.forEach((instance) => instance.toTextArea());
      simpleMDEInstances.value = [];

      ipfsHashes.value = requestObject.value.targetsIPFSHashes;

      reviewObject.reviews = [];
      for (let i = 0; i < reviewForm.value.questions.length; i++) {
        reviewObject.reviews.push({ answer: "" });
      }
      hypercertReviews.value = (
        await getReviews(requestObject.value.requestName)
      ).response?.reviews.filter((r) => r.hypercertID == tokenID);
      hypercertName.value = await getHypercertName();

      requestObjectReady.value = true;

      await loadPastAnswers(
        requestObject.value.reviewFormName,
        reviewRequests.value,
        tokenID,
        selectedReviewRequest.value,
        reviewForm.value.types
      );

      await simpleMDEInitializer();

      loading.value = false;
    };

    watch([contractRef], async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        requestNames.value = await getRequestNames(payload);
      }
    });

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }

    const handleFileChange = async (file) => {
      isFormLoading.value = true;
      try {
        const base64File = await fileToBase64(file.raw);
        const response = await fetch(
          process.env.VUE_APP_CLOUD_FUNCTIONS_BASE_URL +
            "/api/upload-file-to-ipfs",
          {
            method: "POST",
            body: JSON.stringify({ file: base64File }),
          }
        );

        const data = await response.json();

        attachedFiles.value.push({
          fileName: file.name,
          ipfsHash: data.ipfsHash,
        });
      } catch (error) {
        ElNotification({
          title: "Error",
          message: "Attachment not processed. The file size limit is 50mb.",
          type: "error",
          duration: notificationTime,
        });
        console.error("Error uploading the file: ", error);
      }
      isFormLoading.value = false;
    };

    const removeAttachment = (index) => {
      attachedFiles.value.splice(index, 1);
    };

    return {
      attachedFiles,
      walletAddressRef,
      reviewObject,
      requestObjectReady,
      requestNames,
      reviewRequests,
      selectedReviewRequest,
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
      updateSubmitForm,
      loadPastAnswers,
      sendBtn,
      handleFileChange,
      removeAttachment,
      v$,
    };
  },
};
</script>

<style scoped>
.delete-attachment-row {
  margin-left: 1%;
}
.review-select {
  width: 50%;
}

.selection-container {
  display: flex;
  width: 100%;
}

.getForm {
  order: 2;
}

.review-container {
  padding: 20px;
}

.submit-review-form {
  display: flex;
  flex-direction: column;
  width: 90%;
}

.review-row {
  margin-top: 10px;
}

.action-row {
  margin-top: 5px;
  display: flex;
  justify-content: center;
}
.getForm {
  margin-left: 2%;
}
.submit-review-page {
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
.submitReviewFormContainer {
  width: 65%;
}
@media (max-width: 768px) {
  .submitReviewFormContainer {
    width: 100%;
  }
  .selection-container {
    flex-direction: column;
  }

  .submit-review-form {
    width: 100%;
  }

  .getForm {
    width: 50%;
    order: 1;
    margin-top: 5%;
  }

  .review-select {
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
