<template>
  <div class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Get Review Request</h1>
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
    <div v-if="requestObject">
      <el-row>
        <el-col :span="24">
          <h2>Reviews</h2>
          <div v-if="requestObject.reviews.length > 0">
            <el-card
              v-for="(review, index) in requestObject.reviews"
              :key="index"
              class="review-card"
              shadow="hover"
            >
              <template #header>
                <div class="card-header">
                  <span class="review-title"
                    >Review #{{ index + 1 }} by ({{ review.reviewer }})</span
                  >
                </div>
              </template>
              <div class="review-body">
                <span style="font-weight: bolder">Target</span><br />
                <a
                  :href="requestObject.targets[review.targetIndex]"
                  target="_blank"
                  style="text-decoration: none"
                >
                  {{ requestObject.targets[review.targetIndex] }} </a
                ><br /><br />
                <span style="font-weight: bolder">Target IPFS Hash</span><br />
                <a
                  :href="`https://ipfs.io/ipfs/${
                    requestObject.targetsIPFSHashes[review.targetIndex]
                  }`"
                  target="_blank"
                  style="text-decoration: none"
                >
                  {{ requestObject.targetsIPFSHashes[review.targetIndex] }} </a
                ><br /><br /><br />
                <div v-for="(question, index) in reviewForm[0]" :key="index">
                  <span style="font-weight: bolder">{{ question }}</span
                  ><br />
                  {{ review.answers[index] }}
                  <br /><br />
                </div>
              </div>
            </el-card>
          </div>
          <div v-else>
            <el-card>
              There are no available reviews for this request yet.
            </el-card>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <h2>Review Request</h2>
          <el-card class="review-card" shadow="hover">
            <div class="review-body">
              <span style="font-weight: bolder">Reviewers</span><br />
              <div
                v-for="(reviewer, index) in requestObject.reviewers"
                :key="index"
              >
                {{ reviewer }}<br />
              </div>
              <br /><br />
              <span style="font-weight: bolder">Targets</span><br /><br />
              <div
                v-for="(target, index) in requestObject.targets"
                :key="index"
              >
                <span style="font-weight: bolder">Target {{ index + 1 }}</span
                ><br />
                <a :href="target" target="_blank" style="text-decoration: none">
                  {{ target }}
                </a>
                <br /><br />
                <span style="font-weight: bolder">Target IPFS Hash</span>
                <br />
                <a
                  :href="`https://ipfs.io/ipfs/${requestObject.targetsIPFSHashes[index]}`"
                  target="_blank"
                  style="text-decoration: none"
                >
                  {{ requestObject.targetsIPFSHashes[index] }}
                </a>
                <br /><br />
              </div>
              <br />
              <span style="font-weight: bolder">IPFS Hash</span>
              <br />
              <a
                :href="`https://ipfs.io/ipfs/${requestObject.formIpfsHash}`"
                target="_blank"
                style="text-decoration: none"
              >
                {{ requestObject.formIpfsHash }}
              </a>
              <br /><br />
              <span style="font-weight: bolder">Reward per review </span><br />
              {{ requestObject.rewardPerReview / 1000000000000000000 }} ETH
              <br /><br />
              <span style="font-weight: bolder">Closed</span><br />
              {{ requestObject.isClosed ? "Yes" : "No" }} <br /><br />
              <span style="font-weight: bolder">Review Form index</span><br />
              {{ requestObject.reviewFormIndex }}<br /><br />
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <h2>Review Form</h2>
          <el-table :data="formData" border style="width: 100%">
            <el-table-column prop="question" label="Question" />
            <el-table-column prop="type" label="Type" />
            <el-table-column prop="choices" label="Choices" />
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  getReviewForm,
  getRequestNames,
  getRequest,
} from "@/services/ContractService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";

export default {
  name: "CreateReviewRequest",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState },
    } = store;

    const contract = computed(() => contractState.contract);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

    const requestName = ref("");
    const requestNames = ref();
    const requestObject = ref();
    const reviewForm = ref({});
    const contractRef = ref(contract);
    const formData = ref();

    const sendBtn = async () => {
      dispatch("setLoading", true);
      const payload = {
        requestName: requestName.value,
        contractMethods: contract.value.methods,
      };

      try {
        formData.value = [];

        requestObject.value = await getRequest(payload);

        const reviewFormPayload = {
          reviewFormIndex: requestObject.value.reviewFormIndex,
          contractMethods: contract.value.methods,
        };
        reviewForm.value = await getReviewForm(reviewFormPayload);
        reviewForm.value[0].forEach((question, index) => {
          let reviewFormHash = {
            question: "",
            type: "",
            choices: "",
          };

          reviewFormHash.question = reviewForm.value[0][index];
          reviewFormHash.type =
            reviewForm.value[1][index] == 0
              ? "Text"
              : reviewForm.value[1][index] == 1
              ? "Yes/No"
              : "Single Choice";
          reviewFormHash.choices = reviewForm.value[2][index].join("\n");

          formData.value.push(reviewFormHash);
        });
      } catch (e) {
        ElNotification({
          title: "Error getting Review Request",
          message: `${e}`,
          type: "error",
          duration: notificationTime,
        });
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
      formData,
      requestObject,
      reviewForm,
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
.review-card {
  margin-top: 30px;
  text-align: left;
}
.review-title {
  font-size: 20px;
  font-weight: bold;
}
.review-body {
  font-size: 15px;
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
