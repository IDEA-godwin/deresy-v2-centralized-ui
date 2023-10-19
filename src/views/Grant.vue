<template>
  <div class="grant-page" v-loading="loading">
    <div v-if="!loading">
      <div v-if="!grantNotFound">
        <el-row>
          <el-col
            :style="
              grant.image_css.length > 1
                ? grant.image_css
                : 'background-color:black; height:290px'
            "
          >
            <el-image
              :src="grant.logo_url"
              class="image grant-image"
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
        </el-row>

        <el-row v-if="!!grant.summary">
          <el-col class="title-col">
            <el-row class="section__summary">
              <div class="section__title">
                <h3>Summary</h3>
              </div>
              <el-card class="section__content" shadow="hover">
                {{ grant.summary }}
              </el-card>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="title-col">
            <el-row>
              <span class="title-text">
                {{ grant.title }}
              </span>
            </el-row>
            <el-row style="margin-top: 20px">
              <div v-if="reviewRequests.length > 0">
                <div v-if="areAllRequestsClosed" class="warning custom-block">
                  This request is closed and does no longer accept reviews.
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
                  @click="scrollToAbout()"
                >
                  See Project
                  <el-icon class="el-icon--right">
                    <ArrowDownBold />
                  </el-icon>
                </el-button>
              </div>
              <div v-else>
                <div class="warning custom-block">
                  No reviews available for this grant.
                </div>
              </div>
              <a target="_blank" :href="`${ipfsBaseUrl}/get_request.html`">
                <el-button type="primary" class="d-round-btn" round>
                  See Review Request (IPFS)
                </el-button>
              </a>
            </el-row>
            <hr />
            <el-row class="grant-stats-row">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="grant-stat" v-if="grant.reference_url">
                  <el-icon :size="small" color="#6610f2" class="grant-icon-sm">
                    <Pointer />
                  </el-icon>
                  <a
                    :href="`${grant.reference_url}`"
                    target="_blank"
                    class="grant-link"
                  >
                    {{ grant.reference_url }}
                  </a>
                </div>
                <div class="grant-stat" v-if="grant.twitter_handle_1">
                  <el-icon :size="small" color="#6610f2" class="grant-icon-sm">
                    <Connection />
                  </el-icon>
                  <a
                    :href="`https://twitter.com/${grant.twitter_handle_1}`"
                    target="_blank"
                    class="grant-link"
                  >
                    {{ grant.twitter_handle_1 }}
                  </a>
                </div>
                <div class="grant-stat" v-if="grant.last_update_natural">
                  <el-icon :size="small" color="#6610f2" class="grant-icon-sm">
                    <Watch />
                  </el-icon>
                  {{ `Updated ${grant.last_update_natural} ago` }}
                </div>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="grant-stat" v-if="grant.admin_address">
                  <el-icon size="small" color="#6610f2" class="grant-icon-sm">
                    <Promotion />
                  </el-icon>
                  <a
                    :href="`https://etherscan.io/address/${grant.admin_address}`"
                    target="_blank"
                    class="grant-link"
                  >
                    {{ formatAddress(grant.admin_address) }}
                  </a>
                  <el-button
                    class="copy-to-clipboard"
                    @click="copyToClipboard(grant.admin_address)"
                    type="primary"
                    size="small"
                    round
                  >
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </div>
                <div class="grant-stat" v-if="grant.region.label">
                  <el-icon :size="small" color="#6610f2" class="grant-icon-sm">
                    <LocationFilled />
                  </el-icon>
                  {{ grant.region.label }}
                </div>
                <div class="grant-stat" v-if="grant.details_url">
                  <el-icon :size="small" color="#6610f2" class="grant-icon-sm">
                    <Platform />
                  </el-icon>
                  <a
                    :href="`https://gitcoin.co${grant.details_url}`"
                    target="_blank"
                    class="grant-link"
                  >
                    Gitcoin page
                  </a>
                </div>
              </el-col>
            </el-row>
            <hr />
            <el-row>
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
                            :href="`${easExplorerUrl}/schema/view/${
                              getReviewForm(reviewGroup.reviews[0].formID)
                                ?.easSchemaID
                            }`"
                            target="_blank"
                            style="text-decoration: none"
                            >{{
                              getReviewForm(reviewGroup.reviews[0].formID)
                                ?.easSchemaID
                            }}</a
                          ><br /><br />

                          <span style="font-weight: bolder">Hypercert</span
                          ><br />
                          <a
                            :href="hypercertLink"
                            target="_blank"
                            style="text-decoration: none"
                            >{{
                              `${hypercertName}(ID: ${reviewGroup.reviews[0].hypercertID})`
                            }}</a
                          ><br /><br />
                        </div>

                        <ReviewsContentDisplay
                          :reviewData="reviewGroup"
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
        <hr />
        <el-row>
          <el-col class="grant-about-col" :span="24" id="about-row">
            <el-row>
              <el-col class="grant-about-title">
                <span>About</span>
              </el-col>
              <el-col class="grant-about-text" :span="24">
                <div v-html="aboutContent"></div>
              </el-col>
            </el-row>
            <hr />
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
import marked from "marked";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { onBeforeMount, reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import ReviewsContentDisplay from "@/components/grant/reviews-content-display";
import { getGrant } from "@/services/GrantService";
import { getAllReviews } from "@/services/ReviewService";
import { getReviewRequests } from "@/services/ReviewRequestService";
import { getAllReviewForms } from "@/services/ReviewFormService";

import { ElMessage } from "element-plus";
import {
  FullScreen,
  Pointer,
  Connection,
  Watch,
  Promotion,
  LocationFilled,
  CopyDocument,
  Platform,
  ArrowDownBold,
} from "@element-plus/icons";

import {
  HYPERCERT_CONTRACT_ADDRESS,
  HYPERCERT_CONTRACT_ABI,
} from "@/constants/contractConstants";
import { optimismWeb3 } from "@/web3";

export default {
  name: "Grant",
  components: {
    FullScreen,
    Pointer,
    Connection,
    Watch,
    Promotion,
    LocationFilled,
    CopyDocument,
    Platform,
    ArrowDownBold,
    ReviewsContentDisplay,
  },
  setup() {
    const store = useStore();
    const {
      state: { user },
    } = store;
    const route = useRoute();
    const router = useRouter();

    const aboutContent = ref("");
    const dataTable = ref([]);
    const grantID = route.params.grant_id;
    const grant = ref(null);
    const reviewRequests = ref([]);
    const reviews = ref([]);
    const reviewForms = ref([]);
    const ipfsBaseUrl = ref("");
    const pinataGatewayUrl = ref("");
    const easExplorerUrl = ref("");
    const walletAddress = computed(() => user.walletAddress);
    const hypercertLink = ref("");
    const hypercertName = ref("");

    const loading = ref(true);
    const grantNotFound = ref(true);
    const state = reactive({
      grantData: {},
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

    const scrollToAbout = () => {
      document.querySelector("#about-row").scrollIntoView({
        behavior: "smooth",
      });
    };

    const goToSubmitReview = () => {
      router.push({
        path: `/grants/${grantID}/submit-review/`,
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

    const fetchGrant = async () => {
      grant.value = (await getGrant(grantID)).response;
      const deltaOps = JSON.parse(grant.value.description_rich).ops;
      const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
      aboutContent.value = converter.convert();
    };

    const fetchReviewRequests = async () => {
      const reviewRequestsResponse = await getReviewRequests(
        grant.value.request_names,
        grant.value.hypercertID
      );
      reviewRequests.value = reviewRequestsResponse.response;
    };

    const fetchReviews = async () => {
      const allReviews = await getAllReviews();

      if (!allReviews.response) {
        return;
      }

      let groupedReviews = {};

      allReviews.response.forEach((reviewDocument) => {
        reviewDocument.reviews.forEach((r) => {
          if (
            grant.value.request_names?.includes(reviewDocument.requestName) &&
            r.hypercertID === grant.value.hypercertID
          ) {
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
      const reviewFormResponse = await getAllReviewForms();

      const reviewFormIndexes = reviewRequests.value.map((request) =>
        parseInt(request.reviewFormIndex)
      );

      reviewForms.value = reviewFormResponse.response.filter((form) =>
        reviewFormIndexes.includes(form.formID)
      );
    };

    const getSummaries = (params) => {
      const { columns, data } = params;
      const sums = [];

      columns.forEach((column, index) => {
        const values = data.map((item) => Number(item[column.property]));

        if (!values.every((value) => Number.isNaN(value))) {
          const sum = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!Number.isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);

          sums[index] = (sum / values.length).toFixed(1);
        } else {
          sums[index] = "N/A";
        }
      });

      return sums;
    };

    const getHypercertName = async () => {
      const hypercertContract = new optimismWeb3.eth.Contract(
        HYPERCERT_CONTRACT_ABI,
        HYPERCERT_CONTRACT_ADDRESS,
        {
          from: walletAddress.value,
        }
      );

      const uri = await hypercertContract.methods
        .uri(grant.value.hypercertID.toString())
        .call();
      if (uri) {
        const sanitizedUri = uri.replace(/^ipfs:\/\//, "");
        const data = await (
          await fetch(`https://ipfs.io/ipfs/${sanitizedUri}`)
        ).json();
        return data.name;
      } else {
        return "Name unavailable";
      }
    };

    onBeforeMount(async () => {
      await fetchGrant();

      if (grant.value) {
        grantNotFound.value = false;
        await fetchReviewRequests();
        await fetchReviews();
        await fetchReviewForms();
      }

      ipfsBaseUrl.value = process.env.VUE_APP_IPFS_BASE_URL;
      pinataGatewayUrl.value = process.env.VUE_APP_PINATA_GATEWAY_BASE_URL;
      easExplorerUrl.value = process.env.VUE_APP_EAS_EXPLORER_URL;
      hypercertLink.value = `${
        process.env.VUE_APP_HYPERCERTS_BASE_URL
      }${process.env.VUE_APP_HYPERCERT_CONTRACT_ADDRESS.toLowerCase()}-${
        grant.value.hypercertID
      }`;
      hypercertName.value = await getHypercertName();
      loading.value = false;
    });

    const markdownToHtml = (markdown) => {
      return marked.parse(markdown);
    };

    return {
      dataTable,
      grant,
      reviews,
      reviewForms,
      reviewRequests,
      loading,
      walletAddress,
      grantNotFound,
      state,
      aboutContent,
      ipfsBaseUrl,
      pinataGatewayUrl,
      easExplorerUrl,
      hypercertLink,
      hypercertName,
      isReviewerForAny,
      areAllRequestsClosed,
      getSummaries,
      getReviewForm,
      markdownToHtml,
      goToSubmitReview,
      scrollToAbout,
      copyToClipboard,
      formatAddress,
    };
  },
};
</script>
<style scoped lang="scss">
.review-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 20px;
}
.show-past-revisions {
  margin-left: 3%;
}
.grant-page {
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
  font-size: 25px;
  font-weight: bold;
}

.title-col {
  width: 100%;
  text-align: left;
  padding: 3% 10%;
}

.grant-stats-row {
  font-size: 18px;
  padding: 1%;
}
.grant-stat {
  margin: 3% 0%;
}
.grant-icon-sm {
  margin-right: 20px;
}
.grant-link {
  text-decoration: none;
  color: #6610f2;
}

.grant-about-col {
  width: 100%;
  text-align: left;
  padding: 3% 10%;
}

.grant-about-title {
  font-size: 25px;
  font-weight: bold;
  margin: 0 0 2% 0;
}

.grant-about-text {
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
.grant-image {
  width: 100%;
  height: 290px;
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
