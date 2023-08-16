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
              <div v-if="reviewRequest">
                <div v-if="reviewRequest.isClosed" class="warning custom-block">
                  This request is closed and does no longer accept reviews.
                </div>
                <div v-else style="display: inline-flex">
                  <div
                    v-if="reviewRequest.reviewers.includes(walletAddress)"
                    style="display: inline-flex"
                  >
                    <el-button
                      type="primary"
                      class="d-round-btn"
                      @click="goToSubmitReview()"
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
                <div v-if="reviewRequest.isClosed" class="warning custom-block">
                  This request is closed and does no longer accept reviews.
                </div>
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
            <el-row class="section__review-scoring">
              <div class="section__title">
                <h3>Review Scoring</h3>
              </div>
              <el-card class="section__content" shadow="hover">
                <el-table
                  header-cell-class-name="header-summary"
                  border
                  :data="dataTable"
                  :summary-method="getSummaries"
                  show-summary
                >
                  <el-table-column
                    align="right"
                    prop="answer1"
                    :label="reviewForm.questions[10]"
                  />
                  <el-table-column
                    align="right"
                    prop="answer2"
                    :label="reviewForm.questions[11]"
                  />
                  <el-table-column
                    align="right"
                    prop="average"
                    label="Average"
                    width="100"
                  />
                </el-table>
              </el-card>
            </el-row>
            <hr />
            <el-row>
              <el-col :span="24" class="reviews-col">
                <el-col class="review-title-col">
                  <span>Reviews</span>
                </el-col>
                <el-col class="reviews-cards-col">
                  <div v-if="reviews?.length > 0">
                    <el-card
                      v-for="(review, index) in reviews"
                      :key="index"
                      class="review-card"
                      shadow="hover"
                    >
                      <template #header>
                        <div class="card-header">
                          <span class="review-title"
                            >Review #{{ index + 1 }} by ({{
                              review.reviewer
                            }})</span
                          >
                        </div>
                      </template>
                      <div class="review-body">
                        <span style="font-weight: bolder">Target</span><br />
                        <a
                          :href="reviewRequest.targets[review.targetIndex]"
                          target="_blank"
                          style="text-decoration: none"
                        >
                          {{ reviewRequest.targets[review.targetIndex] }} </a
                        ><br /><br />
                        <span style="font-weight: bolder">Target IPFS Hash</span
                        ><br />
                        <a
                          :href="`https://ipfs.io/ipfs/${
                            reviewRequest.targetsIPFSHashes[review.targetIndex]
                          }`"
                          target="_blank"
                          style="text-decoration: none"
                        >
                          {{
                            reviewRequest.targetsIPFSHashes[review.targetIndex]
                          }}
                        </a>
                        <div
                          v-for="(question, index) in reviewForm.questions"
                          :key="index"
                        >
                          <span class="review-question">{{ question }}</span
                          ><br /><br />
                          <div
                            class="answer-card"
                            v-html="markdownToHtml(review.answers[index])"
                          ></div>
                          <br /><br />
                        </div>
                      </div>
                    </el-card>
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

import { getGrant } from "@/services/GrantService";
import { getReviews } from "@/services/ReviewService";
import { getReviewRequest } from "@/services/ReviewRequestService";
import { getReviewForm } from "@/services/ReviewFormService";

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
    const reviewRequest = ref(null);
    const reviews = ref([]);
    const reviewForm = ref(null);
    const ipfsBaseUrl = ref("");
    const walletAddress = computed(() => user.walletAddress);

    const loading = ref(true);
    const grantNotFound = ref(true);
    const state = reactive({
      grantData: {},
      reviewRequest: {},
      reviews: [],
      reviewForm: {},
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

    const fetchReviewRequest = async () => {
      const reviewRequestResponse = await getReviewRequest(
        grant.value.request_name
      );
      reviewRequest.value = reviewRequestResponse.response;
    };

    const fetchReviews = async () => {
      const reviewsResponse = await getReviews(grant.value.request_name);
      reviews.value = reviewsResponse.response?.reviews.filter(
        (r) =>
          Number(r.targetIndex) ===
          reviewRequest.value.targets.indexOf(grant.value.request_target)
      );
    };

    const fetchReviewForm = async () => {
      const reviewFormResponse = await getReviewForm(
        reviewRequest.value.reviewFormIndex
      );
      reviewForm.value = reviewFormResponse.response;
    };

    const getReviewScoring = () => {
      dataTable.value = reviews.value.map((review, i) => {
        const answer1Score = Number(review.answers[10]);
        const answer2Score = Number(review.answers[11]);
        const average = (answer1Score + answer2Score) / 2;

        return {
          index: i + 1,
          answer1: answer1Score.toFixed(1),
          answer2: answer2Score.toFixed(1),
          average,
        };
      });
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

    onBeforeMount(async () => {
      await fetchGrant();

      if (grant.value) {
        grantNotFound.value = false;
        await fetchReviewRequest();
        await fetchReviews();
        await fetchReviewForm();
        getReviewScoring();
      }
      ipfsBaseUrl.value = process.env.VUE_APP_IPFS_BASE_URL;
      loading.value = false;
    });

    const markdownToHtml = (markdown) => {
      return marked.parse(markdown);
    };

    return {
      dataTable,
      grant,
      reviews,
      reviewForm,
      reviewRequest,
      loading,
      walletAddress,
      grantNotFound,
      state,
      aboutContent,
      ipfsBaseUrl,
      getSummaries,
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
  font-size: 20px;
}
</style>
