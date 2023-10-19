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
      ><br /><br />
    </div>

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
  </div>
</template>

<script>
import marked from "marked";

export default {
  name: "ReviewsContentDisplay",
  props: {
    reviewData: Object,
    reviewForms: Array,
    easExplorerUrl: String,
    pinataGatewayUrl: String,
  },
  setup(props) {
    const getReviewForm = (formID) => {
      return props.reviewForms.find((form) => form.formID == formID) || {};
    };

    const formatDate = (unixTimestamp) => {
      const date = new Date(unixTimestamp * 1000);

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: true,
      };

      return date.toLocaleString("en-US", options);
    };

    const markdownToHtml = (markdown) => {
      return marked.parse(markdown);
    };

    return {
      getReviewForm,
      formatDate,
      markdownToHtml,
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
</style>
