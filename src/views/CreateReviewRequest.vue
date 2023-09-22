<template>
  <div v-loading="isFormLoading" class="form-container">
    <el-row>
      <el-col :span="24">
        <el-form label-position="top" class="review-form">
          <h1>Create Review Request</h1>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Name">
                <el-input
                  v-model="requestObject.name"
                  placeholder="Enter a name for the request"
                />
                <span class="vuelidation-error" v-if="v$.name.$error">{{
                  v$.name.$errors[0].$message
                }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Review Form Index">
                <el-select
                  v-model="requestObject.reviewFormIndex"
                  placeholder="Select a review form index"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(o, index) in parseInt(reviewFormsTotal)"
                    :key="index"
                    :label="`Index ${index}`"
                    :value="index"
                  ></el-option>
                </el-select>
                <span
                  class="vuelidation-error"
                  v-if="v$.reviewFormIndex.$error"
                  >{{ v$.reviewFormIndex.$errors[0].$message }}</span
                >
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="20">
              <label class="el-form-item__label">Reviewers</label>
            </el-col>
            <el-col :span="24">
              <div
                v-for="(reviewer, index) in requestObject.reviewers"
                :key="index"
                class="review-row"
              >
                <el-row :gutter="20">
                  <el-col :span="22">
                    <el-input
                      v-model="requestObject.reviewers[index].address"
                      placeholder="Enter a reviewer address"
                    />
                    <div v-if="v$.reviewers.$error" style="margin-top: 10px">
                      <span class="vuelidation-error">{{
                        v$.reviewers.$errors[0].$message[index][0]
                      }}</span>
                    </div>
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      circle
                      type="danger"
                      :icon="CloseBold"
                      size="small"
                      @click="removeReviewer(index)"
                      v-if="index > 0"
                    ></el-button>
                  </el-col>
                </el-row>
              </div>
              <el-row class="form-section">
                <el-col :span="24">
                  <el-button
                    @click="addReviewer()"
                    class="add-btn"
                    type="primary"
                    >Add Reviewer</el-button
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="11"
              ><label class="el-form-item__label">Targets</label></el-col
            >
            <el-col :span="11" style="padding-left: 10px"
              ><label class="el-form-item__label"
                >Target IPFS Hashes</label
              ></el-col
            >
            <el-col :span="24">
              <div
                v-for="(target, index) in requestObject.targets"
                :key="index"
                class="target-row"
              >
                <el-row :gutter="20">
                  <el-col :span="11">
                    <el-input
                      v-model="requestObject.targets[index].address"
                      placeholder="Enter a target address"
                    />
                    <div v-if="v$.targets.$error" style="margin-top: 10px">
                      <span class="vuelidation-error">{{
                        v$.targets.$errors[0]?.$message[index][0]
                      }}</span>
                    </div>
                  </el-col>
                  <el-col :span="11">
                    <el-input
                      v-model="requestObject.targets[index].ipfsHash"
                      placeholder="Enter a target IPFS Hash"
                    />
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      circle
                      type="danger"
                      :icon="CloseBold"
                      size="small"
                      @click="removeTarget(index)"
                      v-if="index > 0"
                    ></el-button>
                  </el-col>
                </el-row>
              </div>
              <el-row class="form-section">
                <el-col :span="24">
                  <el-button @click="addTarget()" class="add-btn" type="primary"
                    >Add Target</el-button
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Request IPFS Hash">
                <el-input
                  v-model="requestObject.requestHash"
                  placeholder="Enter a request IPFS Hash"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Paid Review">
                <el-radio-group v-model="requestObject.isPaidReview">
                  <el-radio-button :label="true">Yes</el-radio-button>
                  <el-radio-button :label="false">No</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Reward per review">
                <el-input
                  v-model="requestObject.rewardPerReview"
                  type="number"
                  placeholder="Enter the rewards per review"
                  :disabled="isRewardDisabled"
                />
                <span
                  class="vuelidation-error"
                  v-if="v$.rewardPerReview.$error"
                  >{{ v$.rewardPerReview.$errors[0].$message }}</span
                >
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-button
                @click="sendBtn()"
                class="send-btn"
                type="success"
                size="large"
                >Send</el-button
              >
            </el-col>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import { CloseBold } from "@element-plus/icons";
import { getReviewFormsTotal, handleRequest } from "@/services/ContractService";
import { useStore } from "vuex";
import { reactive, computed, ref, watch, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

export default {
  name: "CreateReviewRequest",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;

    const web3 = computed(() => contractState.web3);
    const contract = computed(() => contractState.contract);
    const walletAddress = computed(() => user.walletAddress);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

    const reviewFormsTotal = ref(0);
    const contractRef = ref(contract);
    const isFormLoading = ref(false);

    const requestObject = reactive({
      name: "",
      reviewFormIndex: "",
      targets: [],
      reviewers: [],
      requestHash: "",
      rewardPerReview: "",
      isPaidReview: true,
    });

    const isRewardDisabled = computed(() => !requestObject.isPaidReview);
    const requestFunction = handleRequest;

    const rules = computed(() => {
      return {
        name: { required },
        reviewFormIndex: { required },
        targets: {
          $each: helpers.forEach({
            address: {
              required,
            },
          }),
        },
        reviewers: {
          $each: helpers.forEach({
            address: {
              required,
            },
          }),
        },
        rewardPerReview: { required },
      };
    });
    const v$ = useVuelidate(rules, requestObject);

    const addReviewer = () => {
      requestObject.reviewers.push({ address: "" });
    };

    const addTarget = () => {
      requestObject.targets.push({ address: "", ipfsHash: "" });
    };

    const removeReviewer = (index) => {
      requestObject.reviewers.splice(index, 1);
    };

    const removeTarget = (index) => {
      requestObject.targets.splice(index, 1);
    };

    const sendBtn = async () => {
      isFormLoading.value = true;
      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);
        const rewardPerReviewToWei = web3.value.utils.toWei(
          requestObject.rewardPerReview.toString(),
          "ether"
        );
        const totalReward =
          rewardPerReviewToWei *
          requestObject.reviewers.length *
          requestObject.targets.length;

        const targetAddresses = requestObject.targets.map((target) => {
          return target.address;
        });
        const targetHashes = requestObject.targets.map((target) => {
          return target.ipfsHash;
        });
        const reviewersAddresses = requestObject.reviewers.map((reviewer) => {
          return reviewer.address;
        });

        const payload = {
          name: requestObject.name,
          reviewFormIndex: requestObject.reviewFormIndex,
          targets: targetAddresses,
          targetHashes: targetHashes,
          reviewers: reviewersAddresses,
          requestHash: requestObject.requestHash,
          rewardPerReview: rewardPerReviewToWei,
          totalReward: totalReward,
          contractAddress: DERESY_CONTRACT_ADDRESS,
          walletAddress: walletAddress.value,
        };

        try {
          await requestFunction(
            web3.value,
            contract.value,
            payload,
            requestObject.isPaidReview
          );

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
      requestObject.reviewers.push({ address: "" });
      requestObject.targets.push({ address: "", ipfsHash: "" });

      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getReviewFormsTotal(payload);
      }
    });

    watch([contractRef], async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getReviewFormsTotal(payload);
      }
    });

    watch(
      () => requestObject.isPaidReview,
      (newVal) => {
        requestObject.rewardPerReview = newVal ? "" : "0";
      }
    );

    return {
      CloseBold,
      requestObject,
      reviewFormsTotal,
      isRewardDisabled,
      isFormLoading,
      addReviewer,
      addTarget,
      removeReviewer,
      removeTarget,
      sendBtn,
      v$,
    };
  },
};
</script>

<style scoped>
.form-container {
  text-align: left;
  padding: 2% 10%;
}

.review-form {
  width: 100%;
}

.form-section {
  width: 100%;
  margin-bottom: 5px;
}

.send-btn {
  margin: 10px 0px;
  float: left;
}

.add-btn {
  margin: 10px 0px;
}

.vuelidation-error {
  color: #dd0c0c;
  font-size: 12px;
  font-weight: bolder;
  text-align: left;
  margin-top: 5px;
}
.target-row + .target-row,
.review-row + .review-row {
  margin-top: 20px;
}
</style>
