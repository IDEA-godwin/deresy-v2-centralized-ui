<template>
  <div v-loading="isFormLoading" class="form-container">
    <el-row>
      <el-col :span="24">
        <el-form label-position="top" class="review-form">
          <h1>Create Review Request</h1>

          <el-row class="form-section">
            <el-col :span="22">
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
            <el-col :span="22">
              <el-form-item label="Review Form Name">
                <el-select
                  v-model="requestObject.reviewFormName"
                  placeholder="Select a review form name"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="value in reviewFormsTotal"
                    :key="value"
                    :label="`${value}`"
                    :value="value"
                  ></el-option>
                </el-select>
                <span
                  class="vuelidation-error"
                  v-if="v$.reviewFormName.$error"
                  >{{ v$.reviewFormName.$errors[0].$message }}</span
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
                    <div v-if="v$.reviewers.$error" style="margin: 0">
                      <span class="vuelidation-error">
                        {{ v$.reviewers.$errors[0].$message[index][0] }}
                      </span>
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
            <el-col :span="20">
              <label class="el-form-item__label"
                >Reviewer ERC721 Contract Addresses</label
              >
            </el-col>
            <el-col :span="24">
              <div
                v-for="(reviewer, index) in requestObject.reviewerContracts"
                :key="index"
                class="review-row"
              >
                <el-row :gutter="20">
                  <el-col :span="22">
                    <el-input
                      v-model="requestObject.reviewerContracts[index].address"
                      placeholder="Enter a ERC721 contract address"
                    />
                    <div v-if="v$.reviewerContracts.$error" style="margin: 0">
                      <span class="vuelidation-error">
                        {{ v$.reviewerContracts.$errors[0].$message[index][0] }}
                      </span>
                    </div>
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      circle
                      type="danger"
                      :icon="CloseBold"
                      size="small"
                      @click="removeReviewerContract(index)"
                      v-if="index > 0"
                    ></el-button>
                  </el-col>
                </el-row>
              </div>
              <el-row class="form-section">
                <el-col :span="24">
                  <el-button
                    @click="addReviewerContract()"
                    class="add-btn"
                    type="primary"
                    >Add ERC 721 Contract Address</el-button
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Hypercerts from last six months">
                <el-radio-group v-model="hypercertLastSixMonths">
                  <el-radio-button :label="true">Yes</el-radio-button>
                  <el-radio-button :label="false">No</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="11"
              ><label class="el-form-item__label">Hypercert Name</label></el-col
            >
            <el-col :span="11" style="padding-left: 10px"
              ><label class="el-form-item__label"
                >Hypercert IPFS Hashes</label
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
                    <el-select
                      v-model="requestObject.targets[index].address"
                      filterable
                      remote
                      reserve-keyword
                      placeholder="Please enter a keyword"
                      :remote-method="remoteMethod"
                      :loading="hypercertsLoading"
                      loading-text="Loading… this may take a moment"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in hypercertOptions"
                        :key="item.tokenID"
                        :label="item.name"
                        :value="item.tokenID"
                      />
                    </el-select>
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
            <el-col :span="22">
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
            <el-col :span="22">
              <el-form-item label="Payment Token">
                <el-select
                  v-model="requestObject.paymentTokenAddress"
                  :disabled="isRewardDisabled"
                  placeholder="Select payment token"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(symbol, address) in paymentOptions"
                    :key="address"
                    :label="symbol"
                    :value="address"
                  >
                  </el-option>
                </el-select>
                <span
                  class="vuelidation-error"
                  v-if="v$.paymentTokenAddress.$error"
                  >{{ v$.paymentTokenAddress.$errors[0].$message }}</span
                >
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="22">
              <el-form-item label="Reward per review">
                <el-input
                  v-model="requestObject.rewardPerReview"
                  type="number"
                  placeholder="Enter the rewards per review"
                  :disabled="isRewardDisabled"
                />
                <div v-if="v$.rewardPerReview.$error" style="margin-top: 10px">
                  <span class="vuelidation-error">{{
                    v$.rewardPerReview.$errors[0]?.$message
                  }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="form-section">
            <el-col :span="22">
              <el-form-item label="Reviews per Hypercert">
                <el-input
                  v-model="requestObject.reviewsPerHypercert"
                  type="number"
                  placeholder="Enter the reviews per hypercert"
                  :disabled="isRewardDisabled"
                />
                <div
                  v-if="v$.reviewsPerHypercert.$error"
                  style="margin-top: 10px"
                >
                  <span class="vuelidation-error">{{
                    v$.reviewsPerHypercert.$errors[0]?.$message
                  }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <hr class="submit-separator" />
          <el-row class="form-section">
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
                  :disabled="disableSubmit()"
                  >Submit</el-button
                >
              </el-tooltip>
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
import { getPaymentOptions, handleRequest } from "@/services/ContractService";
import { useStore } from "vuex";
import { reactive, computed, ref, watch, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import { getAllReviewFormNames } from "@/services/ReviewFormService";
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

    const web3 = computed(() => contractState.web3);
    const contract = computed(() => contractState.contract);
    const walletAddress = computed(() => user.walletAddress);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;
    const router = useRouter();

    const reviewFormsTotal = ref([]);
    const contractRef = ref(contract);
    const isFormLoading = ref(false);
    const paymentOptions = ref({});
    const hypercertLastSixMonths = ref(true);
    const hypercertOptions = ref([]);
    const hypercertsLoading = ref(false);

    const requestObject = reactive({
      name: "",
      reviewFormName: "",
      targets: [],
      reviewers: [],
      reviewerContracts: [],
      requestHash: "",
      rewardPerReview: "",
      reviewsPerHypercert: "",
      paymentTokenAddress: "",
      isPaidReview: true,
    });

    const isRewardDisabled = computed(() => !requestObject.isPaidReview);
    const requestFunction = handleRequest;

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

    const rules = computed(() => {
      return {
        name: { required },
        reviewFormName: { required },
        paymentTokenAddress: { required },
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
              requiredReviewer: helpers.withMessage(
                "At least 1 Reviewer Address is required when no Reviewer ERC721 Contract Addresses contracts are defined",
                (value) =>
                  requestObject.reviewerContracts[0].address !== "" ||
                  value !== ""
              ),
            },
          }),
        },
        reviewerContracts: {
          $each: helpers.forEach({
            address: {
              requiredReviewer: helpers.withMessage(
                "At least 1 Reviewer ERC721 Contract Addresses is required when no Reviewer Addresses are defined",
                (value) =>
                  requestObject.reviewers[0].address !== "" || value !== ""
              ),
            },
          }),
        },
        rewardPerReview: { required },
        reviewsPerHypercert: { required },
      };
    });
    const v$ = useVuelidate(rules, requestObject);

    const addReviewer = () => {
      requestObject.reviewers.push({ address: "" });
    };

    const addReviewerContract = () => {
      requestObject.reviewerContracts.push({ address: "" });
    };

    const addTarget = () => {
      requestObject.targets.push({ address: "", ipfsHash: "" });
    };

    const removeReviewer = (index) => {
      requestObject.reviewers.splice(index, 1);
    };

    const removeReviewerContract = (index) => {
      requestObject.reviewerContracts.splice(index, 1);
    };

    const removeTarget = (index) => {
      requestObject.targets.splice(index, 1);
    };

    const remoteMethod = async (query) => {
      if (query) {
        hypercertsLoading.value = true;
        let url =
          process.env.VUE_APP_CLOUD_FUNCTIONS_BASE_URL +
          "/api/search_hypercerts?searchInput=" +
          query;

        if (hypercertLastSixMonths.value === true) {
          url += "&lastSixMonths=true";
        }

        try {
          const response = await fetch(url);
          const data = await response.json();
          hypercertOptions.value = data;
        } catch (error) {
          console.error("Failed to fetch options:", error);
        }
        hypercertsLoading.value = false;
      } else {
        hypercertOptions.value = [];
      }
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
          rewardPerReviewToWei * requestObject.reviewsPerHypercert;

        const targetAddresses = requestObject.targets.map((target) => {
          return target.address;
        });

        const targetHashes = requestObject.targets.map((target) => {
          return target.ipfsHash;
        });

        const payload = {
          name: requestObject.name,
          reviewFormName: requestObject.reviewFormName,
          targets: targetAddresses,
          targetHashes: targetHashes,
          reviewers:
            requestObject.reviewers.length < 1 ||
            requestObject.reviewers.every((reviewer) => reviewer.address === "")
              ? []
              : requestObject.reviewers.map((reviewer) => {
                  return reviewer.address;
                }),
          reviewerContracts:
            requestObject.reviewerContracts.length < 1 ||
            requestObject.reviewerContracts.every(
              (reviewerContract) => reviewerContract.address === ""
            )
              ? []
              : requestObject.reviewerContracts.map((reviewerContract) => {
                  return reviewerContract.address;
                }),
          requestHash: requestObject.requestHash,
          rewardPerReview: rewardPerReviewToWei,
          reviewsPerHypercert: requestObject.reviewsPerHypercert,
          totalReward: totalReward,
          contractAddress: DERESY_CONTRACT_ADDRESS,
          paymentTokenAddress: requestObject.paymentTokenAddress,
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
      }
      isFormLoading.value = false;
    };

    onBeforeMount(async () => {
      requestObject.reviewers.push({ address: "" });
      requestObject.reviewerContracts.push({ address: "" });
      requestObject.targets.push({ address: "", ipfsHash: "" });

      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getAllReviewFormNames();
        paymentOptions.value = await getPaymentOptions(payload);
      }
    });

    watch([contractRef], async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getAllReviewFormNames();
        paymentOptions.value = await getPaymentOptions(payload);
      }
    });

    watch(
      () => requestObject.isPaidReview,
      (newVal) => {
        if (newVal) {
          requestObject.rewardPerReview = "";
        } else {
          requestObject.rewardPerReview = "0";
          requestObject.paymentTokenAddress =
            "0x0000000000000000000000000000000000000000";
        }
      }
    );

    return {
      CloseBold,
      requestObject,
      reviewFormsTotal,
      isRewardDisabled,
      isFormLoading,
      paymentOptions,
      hypercertLastSixMonths,
      hypercertOptions,
      hypercertsLoading,
      disableSubmit,
      submitMessage,
      remoteMethod,
      addReviewer,
      addReviewerContract,
      addTarget,
      removeReviewer,
      removeReviewerContract,
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
.submit-separator {
  margin: 30px 0px 20px 0px;
  border-top: 1px solid rgb(235, 233, 233);
}
</style>
