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
      <div v-if="getLatestAmendmentPDFHash(review.attestationID)">
        <span style="font-weight: bolder">PDF File (Original)</span><br />
      </div>
      <div v-else><span style="font-weight: bolder">PDF File</span><br /></div>
      <a
        :href="getIpfsLink(review.attestationID, review.pdfIpfsHash)"
        target="_blank"
        style="text-decoration: none"
        >{{ review.pdfIpfsHash }}</a
      >
    </div>
    <div v-if="getLatestAmendmentPDFHash(review.attestationID)">
      <br />
      <span style="font-weight: bolder">PDF File (Latest Amendment)</span><br />
      <a
        :href="`${pinataGatewayUrl}/ipfs/${getLatestAmendmentPDFHash(
          review.attestationID
        )}`"
        target="_blank"
        style="text-decoration: none"
        >{{ getLatestAmendmentPDFHash(review.attestationID) }}</a
      >
    </div>
    <div v-if="review.reviewer == walletAddress">
      <br />
      <el-button
        type="primary"
        class="d-round-btn"
        @click="goToCreateAmendment(review)"
        round
      >
        Create Amendment
      </el-button>
      <br />
    </div>
    <br /><br />
    <div
      v-for="(question, qIndex) in getReviewForm(review.formName)?.questions"
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
    <div v-if="review.attachmentsIpfsHashes.length > 0">
      <span style="font-weight: bolder">Attachments</span><br />
      <div
        v-for="(attachmentHash, index) in review.attachmentsIpfsHashes"
        :key="index"
      >
        <a
          :href="getIpfsLink(review.attestationID, attachmentHash)"
          target="_blank"
        >
          {{ attachmentHash }}
        </a>
        <br />
      </div>
    </div>
    <el-col class="amendments-col">
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
                  <strong>PDF File </strong>
                  <a
                    :href="
                      getIpfsLink(
                        reviewAmendment.amendmentUID,
                        reviewAmendment.pdfIpfsHash
                      )
                    "
                    target="_blank"
                    >{{ reviewAmendment.pdfIpfsHash }}</a
                  >
                </div>
                <strong>({{ formatDate(reviewAmendment.createdAt) }})</strong>
                <br /><br />
                <div
                  class="answer-card"
                  v-html="markdownToHtml(reviewAmendment.amendment)"
                ></div>
                <br />
                <div v-if="reviewAmendment.attachmentsIpfsHashes.length > 0">
                  <strong>Attachments</strong>
                  <br />
                  <div
                    v-for="(
                      attachmentHash, index
                    ) in reviewAmendment.attachmentsIpfsHashes"
                    :key="index"
                  >
                    <a
                      :href="
                        getIpfsLink(
                          reviewAmendment.amendmentUID,
                          attachmentHash
                        )
                      "
                      target="_blank"
                    >
                      {{ attachmentHash }}
                    </a>
                    <br />
                  </div>
                </div>
                <br />
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
    attestattionsIDs: Array,
    reviewData: Object,
    reviewForms: Array,
    reviewAmendments: Array,
    easExplorerUrl: String,
    pinataGatewayUrl: String,
    tokenID: String,
  },
  setup(props) {
    const store = useStore();
    const {
      state: { user },
    } = store;
    const router = useRouter();
    const walletAddress = computed(() => user.walletAddress);
    const getReviewForm = (formName) => {
      return props.reviewForms.find((form) => form.formName == formName) || {};
    };

    const amendments = (refUID) => {
      if (!props.reviewAmendments) return [];
      return props.reviewAmendments
        .filter((amendment) => amendment.refUID == refUID)
        .sort((a, b) => a.createdAt - b.createdAt);
    };

    const getIpfsLink = (attestationID, ipfsHash) => {
      if (props.attestattionsIDs.includes(attestationID)) {
        return `${props.pinataGatewayUrl}/ipfs/${ipfsHash}`;
      } else {
        return `https://ipfs.io/ipfs/${ipfsHash}`;
      }
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
        path: `/hypercerts/${props.tokenID}/reviews/${review.attestationID}/create-amendment/`,
      });
    };

    const getLatestAmendmentPDFHash = (refUID) => {
      if (!props.reviewAmendments) return null;
      const sortedAmendments = props.reviewAmendments
        .filter((amendment) => amendment.refUID == refUID)
        .sort((a, b) => b.createdAt - a.createdAt);

      for (const amendment of sortedAmendments) {
        if (amendment.pdfIpfsHash && amendment.pdfIpfsHash.length > 0) {
          return amendment.pdfIpfsHash;
        }
      }
      return null;
    };

    return {
      walletAddress,
      amendments,
      getIpfsLink,
      getReviewForm,
      formatDate,
      markdownToHtml,
      getLatestAmendmentPDFHash,
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
.amendments-col {
  margin: 20px 0;
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
