<template>
  <div class="hypercert-page" v-loading="loading">
    <div v-if="!loading">
      <div v-if="!hypercertNotFound">
        <el-row style="padding: 50px 0">
          <el-col
            :xs="24"
            :sm="24"
            :md="6"
            :lg="6"
            :xl="6"
            style="padding: 5% 0 3% 0"
          >
            <el-image
              :src="hypercert.metadata.image"
              class="image hypercert-image"
              fit="contain"
            >
              <template #error>
                <div
                  style="
                    width: 100%;
                    height: 100%;
                    padding-top: 40%;
                    padding-bottom: 60%;
                    font-size: 20px;
                  "
                >
                  <el-icon :size="50" style="width: 3em; height: 3em">
                    <full-screen style="width: 5em; height: 5em" />
                  </el-icon>
                  Loading...
                </div>
              </template>
            </el-image>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="18"
            :lg="18"
            :xl="18"
            class="title-col"
          >
            <hr />
            <el-row style="margin-top: 20px">
              <span class="title-text">
                {{ hypercert.metadata.name }}
              </span>
            </el-row>
            <el-row style="margin-top: 20px">
              <div v-if="reviewRequests.length > 0">
                <div v-if="areAllRequestsClosed" class="warning custom-block">
                  All the review requests for this hypercert are closed and no
                  longer accept reviews.
                </div>
                <div v-else style="display: inline-flex">
                  <div v-if="isReviewerForAny" style="display: inline-flex">
                    <el-button
                      type="primary"
                      class="d-round-btn"
                      @click="goToSubmitReview"
                      round
                    >
                      Submit Review
                    </el-button>
                  </div>
                  <div v-else class="warning custom-block">
                    {{
                      `Your address (${walletAddress}) is not authorized to submit a review for this request.`
                    }}
                  </div>
                </div>
                <el-button
                  class="d-round-btn"
                  round
                  type="primary"
                  @click="scrollToReviews()"
                >
                  See Reviews
                  <el-icon class="el-icon--right">
                    <ArrowDownBold />
                  </el-icon>
                </el-button>
              </div>
              <div v-else>
                <div class="warning custom-block">
                  No reviews available for this hypercert.
                </div>
              </div>
              <a target="_blank" :href="`${ipfsBaseUrl}/get_request.html`">
                <el-button type="primary" class="d-round-btn" round>
                  See Review Request (IPFS)
                </el-button>
              </a>
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.rights.display_value">
              <div class="section__title">
                <h3>Usage rights</h3>
              </div>
              {{ hypercert.metadata.hypercert.rights.display_value }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.description">
              <div class="section__title">
                <h3>Description</h3>
              </div>
              {{ hypercert.metadata.description }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.work_scope">
              <div class="section__title">
                <h3>Work Scope</h3>
              </div>
              {{ hypercert.metadata.hypercert.work_scope.display_value }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.work_timeframe">
              <div class="section__title">
                <h3>Work Timeframe</h3>
              </div>
              {{ hypercert.metadata.hypercert.work_timeframe.display_value }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.impact_scope">
              <div class="section__title">
                <h3>Impact Scope</h3>
              </div>
              {{ hypercert.metadata.hypercert.impact_scope.display_value }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.impact_timeframe">
              <div class="section__title">
                <h3>Impact Timeframe</h3>
              </div>
              {{ hypercert.metadata.hypercert.impact_timeframe.display_value }}
            </el-row>
            <hr />
            <el-row v-if="hypercert.metadata.hypercert.contributors">
              <div class="section__title">
                <h3>Contributors</h3>
              </div>
              {{ hypercert.metadata.hypercert.contributors.display_value }}
            </el-row>
            <hr />
            <el-row id="reviews-row">
              <el-col :span="24" class="reviews-col">
                <el-col class="review-title-col">
                  <span>Reviews</span>
                </el-col>
                <el-col class="reviews-cards-col">
                  <div v-if="reviews?.length > 0">
                    <el-collapse>
                      <el-collapse-item
                        v-for="(reviewGroup, index) in reviews"
                        :key="index"
                        class="review-card"
                      >
                        <template #title>
                          <div class="card-header">
                            <span class="review-title">
                              Review #{{ index + 1 }} by
                              {{ reviewGroup.reviews[0].reviewer }}
                            </span>
                          </div>
                        </template>

                        <div class="review-body">
                          <span style="font-weight: bolder">EAS Schema ID</span>
                          <br />
                          <a
                            :href="`${easExplorerUrl}/schema/view/${easSchemaIDs.reviewsSchemaID}`"
                            target="_blank"
                            style="text-decoration: none"
                          >
                            {{ easSchemaIDs.reviewsSchemaID }}
                          </a>
                          <br /><br />

                          <span style="font-weight: bolder">Hypercert</span
                          ><br />
                          <a
                            :href="hypercertLink"
                            target="_blank"
                            style="text-decoration: none"
                            >{{
                              `${hypercert.metadata.name}(ID: ${reviewGroup.reviews[0].hypercertID})`
                            }}</a
                          ><br /><br />
                        </div>

                        <ReviewsContentDisplay
                          :attestattionsIDs="attestattionsIDs"
                          :reviewData="reviewGroup"
                          :reviewAmendments="reviewAmendments"
                          :tokenID="hypercert.tokenID"
                          :reviewForms="reviewForms"
                          :easExplorerUrl="easExplorerUrl"
                          :pinataGatewayUrl="pinataGatewayUrl"
                        />
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                  <div v-else>
                    <div style="margin-top: 30px">
                      <el-card>
                        There are no available reviews for this request yet.
                      </el-card>
                    </div>
                  </div>
                </el-col>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <div v-else>
        <el-result
          icon="warning"
          title="404"
          sub-title="We're sorry, we couldn't find that hypercert, please try again."
        >
          <template #extra>
            <el-link href="/hypercerts" :underline="false">
              <el-button type="primary" size="large"
                >Explore Hypercerts</el-button
              >
            </el-link>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script>
import marked from "marked";
import { onBeforeMount, reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import ReviewsContentDisplay from "@/components/hypercert/reviews-content-display";
import { getHypercert } from "@/services/HypercertService";
import { getAllReviews } from "@/services/ReviewService";
import { getReviewRequestsByHypercert } from "@/services/ReviewRequestService";
import { getAllReviewForms } from "@/services/ReviewFormService";
import { getReviewAmendments } from "@/services/AmendmentService";
import { getAttestationsIDs } from "@/services/AttestationsService";

import { ElMessage } from "element-plus";
import { ArrowDownBold } from "@element-plus/icons";

export default {
  name: "Hypercert",
  components: {
    ArrowDownBold,
    ReviewsContentDisplay,
  },
  setup() {
    const store = useStore();
    const {
      state: { contractState, user },
    } = store;
    const route = useRoute();
    const router = useRouter();

    const dataTable = ref([]);
    const tokenID = route.params.token_id;
    const hypercert = ref(null);
    const reviewRequests = ref([]);
    const reviews = ref([]);
    const reviewForms = ref([]);
    const ipfsBaseUrl = ref("");
    const pinataGatewayUrl = ref("");
    const easExplorerUrl = ref("");
    const walletAddress = computed(() => user.walletAddress);
    const hypercertLink = ref("");
    const reviewAmendments = ref([]);
    const attestattionsIDs = ref([]);
    const easSchemaIDs = computed(() => contractState.easSchemaIDs);

    const loading = ref(true);
    const hypercertNotFound = ref(true);
    const state = reactive({
      hypercertData: {},
      reviewRequest: {},
      reviews: [],
      reviewForm: {},
    });

    const isReviewerForAny = computed(() => {
      return reviewRequests.value.some((request) =>
        request.reviewers.includes(walletAddress.value)
      );
    });

    const areAllRequestsClosed = computed(() => {
      return reviewRequests.value.every((request) => request.isClosed);
    });

    const scrollToReviews = () => {
      document.querySelector("#reviews-row").scrollIntoView({
        behavior: "smooth",
      });
    };

    const goToSubmitReview = () => {
      router.push({
        path: `/hypercerts/${tokenID}/submit-review/`,
      });
    };

    const copyToClipboard = async (text) => {
      await navigator.clipboard.writeText(text);

      ElMessage({
        message: "Copied to Clipboard!",
        type: "success",
      });
    };

    const formatAddress = (address) => {
      const length = address.length;
      return `${address.substring(0, 6)}...${address.substring(
        length - 5,
        length - 1
      )}`;
    };

    const fetchReviewRequests = async () => {
      reviewRequests.value = (
        await getReviewRequestsByHypercert(tokenID)
      ).response;
    };

    const fetchReviews = async () => {
      const allReviews = await getAllReviews();

      if (!allReviews.response) {
        return;
      }

      let groupedReviews = {};

      allReviews.response.forEach((reviewDocument) => {
        reviewDocument.reviews.forEach((r) => {
          if (r.hypercertID === tokenID) {
            let formID = getRequestFormID(reviewDocument.requestName);

            r.formID = formID;
            r.requestName = reviewDocument.requestName;

            let key = `${r.reviewer}-${formID}`;

            if (!groupedReviews[key]) {
              groupedReviews[key] = [];
            }

            groupedReviews[key].push(r);
          }
        });
      });

      reviews.value = Object.entries(groupedReviews)
        .map(([key, reviewsArray]) => {
          reviewsArray.sort((a, b) => b.createdAt - a.createdAt);

          return {
            key: key,
            reviews: reviewsArray,
          };
        })
        .reverse();
    };

    const getRequestFormID = (requestName) => {
      const matchingRequest = reviewRequests.value.find(
        (req) => req.requestName === requestName
      );
      return matchingRequest.reviewFormIndex;
    };

    const getReviewForm = (formID) => {
      const filteredReviewForm =
        reviewForms.value.find((form) => form.formID == formID) || {};
      return filteredReviewForm;
    };

    const fetchReviewForms = async () => {
      const reviewFormIndexes = reviewRequests.value.map((request) =>
        parseInt(request.reviewFormIndex)
      );

      reviewForms.value = (await await getAllReviewForms()).response.filter(
        (form) => reviewFormIndexes.includes(form.formID)
      );
    };

    onBeforeMount(async () => {
      hypercert.value = (await getHypercert(tokenID)).response;
      reviewAmendments.value = (await getReviewAmendments(tokenID)).response;
      attestattionsIDs.value = (await getAttestationsIDs()).response;

      if (hypercert.value) {
        hypercertNotFound.value = false;
        await fetchReviewRequests();
        await fetchReviews();
        await fetchReviewForms();
      }

      ipfsBaseUrl.value = process.env.VUE_APP_IPFS_BASE_URL;
      pinataGatewayUrl.value = process.env.VUE_APP_PINATA_GATEWAY_BASE_URL;
      easExplorerUrl.value = process.env.VUE_APP_EAS_EXPLORER_URL;
      hypercertLink.value = `${
        process.env.VUE_APP_HYPERCERTS_BASE_URL
      }${process.env.VUE_APP_HYPERCERT_CONTRACT_ADDRESS.toLowerCase()}-${tokenID}`;
      loading.value = false;
    });

    const markdownToHtml = (markdown) => {
      return marked.parse(markdown);
    };

    return {
      easSchemaIDs,
      attestattionsIDs,
      dataTable,
      hypercert,
      reviews,
      reviewForms,
      reviewRequests,
      reviewAmendments,
      loading,
      walletAddress,
      hypercertNotFound,
      state,
      ipfsBaseUrl,
      pinataGatewayUrl,
      easExplorerUrl,
      hypercertLink,
      isReviewerForAny,
      areAllRequestsClosed,
      getReviewForm,
      markdownToHtml,
      goToSubmitReview,
      scrollToReviews,
      copyToClipboard,
      formatAddress,
    };
  },
};
</script>
<style scoped lang="scss">
.hypercert-page {
  height: 100%;
  .section {
    &__title {
      font-weight: bold;
      width: 100%;
    }
    &__content {
      font-size: 16px;
      width: 100%;
    }
  }
}
.title-text {
  font-size: 35px;
  font-weight: bold;
}

.title-col {
  width: 100%;
  text-align: left;
  padding: 3% 3%;
}

.hypercert-stats-row {
  font-size: 18px;
  padding: 1%;
}
.hypercert-stat {
  margin: 3% 0%;
}
.hypercert-icon-sm {
  margin-right: 20px;
}

.hypercert-about-col {
  width: 100%;
  text-align: left;
  padding: 3% 10%;
}

.hypercert-about-title {
  font-size: 25px;
  font-weight: bold;
  margin: 0 0 2% 0;
}

.hypercert-about-text {
  font-size: 16px;
}

hr {
  border-top: 1px solid rgb(197, 197, 197);
  margin: 25px 0px 10px 0px;
}
.review-card {
  margin-top: 30px;
  text-align: left;
  border-radius: var(--el-card-border-radius);
  border: 1px solid var(--el-card-border-color);
  background-color: var(--el-card-bg-color);
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
  --el-card-border-color: var(--el-border-color-light);
  --el-card-border-radius: 4px;
  --el-card-padding: 20px;
  --el-card-bg-color: var(--el-fill-color-blank);
}
.review-title {
  font-size: 20px;
  font-weight: bold;
}
.review-body {
  font-size: 15px;
}

.review-title-col {
  width: 100%;
  text-align: left;
  font-weight: bold;
  font-size: 25px;
  padding-left: 0%;
}

.reviews-cards-col {
  width: 100%;
  text-align: left;
  padding: 0% 0%;
}
.d-round-btn {
  margin: 10px 30px 10px 0px;
  display: inline-flex;
}
.custom-block.warning {
  padding: 8px 16px;
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
  border-radius: 4px;
  border-left: 5px solid var(--el-color-primary);
  margin: 10px 30px 10px 0px;
  font-size: 14px;
  display: inline-flex;
}
</style>
<style>
.el-table .header-summary {
  font-weight: bold;
  color: black;
  text-align: left !important;
}
.el-table .cell {
  word-break: normal !important;
}
.el-table__footer .cell {
  font-weight: bold;
  color: black;
}
.ql-image {
  width: 100%;
  height: auto;
  margin: 2% 0;
}
.copy-to-clipboard {
  cursor: pointer;
  margin-left: 15px;
}
.reviews-col {
  margin: 5% 0;
}
.answer-card {
  font-size: 14px;
  padding: 5px 15px;
  border: 1px solid #ddd;
  box-shadow: 5px 3px 3px #ddd;
}
.hypercert-image {
  width: 100%;
  height: 350px;
}
.review-question {
  font-weight: bolder;
}
.el-collapse-item__header {
  padding: calc(var(--el-card-padding) - 16px) var(--el-card-padding);
  border-bottom: 1px solid var(--el-card-border-color);
  box-sizing: border-box;
  height: auto;
  line-height: auto;
}
.el-collapse-item__header.is-active {
  border-bottom: 1px solid var(--el-card-border-color);
}
.el-collapse-item__content {
  padding: 20px;
}
</style>
