<template>
  <div
    class="review-body"
    v-for="(review, rIndex) in reviewData.reviews"
    :key="rIndex"
  >
    <br />

    <span class="version-title-text">
      Version {{ reviewData.reviews.length - rIndex }} ({{
        formatDate(review.createdAt)
      }})
    </span>
    <br /><br />
    <span style="font-weight: bolder">Attestation ID</span><br />
    <a
      :href="`${easExplorerUrl}/attestation/view/${review.attestationID}`"
      target="_blank"
      style="text-decoration: none"
      >{{ review.attestationID }}</a
    ><br /><br />

    <div v-if="review.pdfIpfsHash">
      <span style="font-weight: bolder">PDF File</span><br />
      <a
        :href="`${pinataGatewayUrl}/ipfs/${review.pdfIpfsHash}`"
        target="_blank"
        style="text-decoration: none"
        >{{ pinataGatewayUrl }}/ipfs/{{ review.pdfIpfsHash }}</a
      >
    </div>
    <el-button
      type="primary"
      class="d-round-btn"
      v-if="review.reviewer == walletAddress"
      @click="goToCreateAmendment(review)"
      round
    >
      Create Amendment
    </el-button>
    <br /><br />
    <br />
    <div
      v-for="(question, qIndex) in getReviewForm(review.formID)?.questions"
      :key="'q-' + qIndex"
    >
      <span class="review-question">{{ question }}</span
      ><br />
      <div
        class="answer-card"
        v-html="markdownToHtml(review.answers[qIndex])"
      ></div>
      <br /><br />
    </div>
    <el-col class="reviews-cards-col">
      <div v-if="amendments(review.attestationID).length > 0">
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <span style="font-weight: bolder">{{
                `Amendments (${amendments(review.attestationID).length})`
              }}</span>
            </template>
            <div
              v-for="(reviewAmendment, index) in amendments(
                review.attestationID
              )"
              :key="index"
            >
              <div>
                <span style="font-weight: bolder">Amendment </span>
                <a
                  :href="`${easExplorerUrl}/attestation/view/${reviewAmendment.amendmentUID}`"
                  target="_blank"
                  style="text-decoration: none; margin-right: 10px"
                  >{{ reviewAmendment.amendmentUID }}</a
                >
                <div v-if="reviewAmendment.pdfIpfsHash.length > 0">
                  <strong>PDF IPFS </strong>
                  <a :href="reviewAmendment.pdfIpfsHash">{{
                    reviewAmendment.pdfIpfsHash
                  }}</a>
                </div>
                <strong>({{ formatDate(reviewAmendment.createdAt) }})</strong>
                <br />
                {{ reviewAmendment.amendment }} <br />
                <hr />
                <br />
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-col>
  </div>
</template>

<script>
import marked from "marked";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed } from "vue";
export default {
  name: "ReviewsContentDisplay",
  props: {
    reviewData: Object,
    reviewForms: Array,
    reviewAmendments: Array,
    easExplorerUrl: String,
    pinataGatewayUrl: String,
    grantID: String,
  },
  setup(props) {
    const store = useStore();
    const {
      state: { user },
    } = store;
    const router = useRouter();
    const walletAddress = computed(() => user.walletAddress);
    const getReviewForm = (formID) => {
      return props.reviewForms.find((form) => form.formID == formID) || {};
    };

    const amendments = (refUID) => {
      return props.reviewAmendments.filter(
        (amendment) => amendment.refUID == refUID
      );
    };

    const formatDate = (unixTimestamp) => {
      const date = new Date(unixTimestamp * 1000);

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return date.toLocaleString("en-US", options);
    };

    const markdownToHtml = (markdown) => {
      return marked.parse(markdown);
    };

    const goToCreateAmendment = (review) => {
      router.push({
        path: `/reviews/${props.grantID}/${review.attestationID}/create-amendment/`,
      });
    };

    return {
      walletAddress,
      amendments,
      getReviewForm,
      formatDate,
      markdownToHtml,
      goToCreateAmendment,
    };
  },
};
</script>

<style scoped lang="scss">
.version-title-text {
  font-size: 24px;
  font-weight: bold;
}

.review-body {
  font-size: 15px;
  background-color: rgba(126, 244, 115, 0.118);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.el-collapse-item__header {
  padding: calc(var(--el-card-padding) - 16px) var(--el-card-padding);
  border-bottom: 1px solid var(--el-card-border-color);
  box-sizing: border-box;
  height: auto;
  line-height: auto;
  background-color: transparent;
}
.el-collapse-item__header.is-active {
  border-bottom: 1px solid var(--el-card-border-color);
}
.el-collapse-item__content {
  padding: 20px;
}
</style>
