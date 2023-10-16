import { getAllReviews } from "@/services/ReviewService";

export const filterReviewRequests = (
  reviewRequests,
  hypercertID,
  reviewFormIndex,
  walletAddress,
  requestName
) => {
  return reviewRequests.filter((request) => {
    return (
      request.hypercertTargetIDs.includes(hypercertID) &&
      request.reviewFormIndex === reviewFormIndex &&
      request.reviewers.includes(walletAddress.value) &&
      request.requestName !== requestName
    );
  });
};

export const getMatchingReview = async (filteredRequests, walletAddress) => {
  const reviews = await getAllReviews();

  if (reviews.response.length == 0) {
    return null;
  }

  for (const request of filteredRequests) {
    const reviewDocument = reviews.response.find(
      (review) => review.requestName === request.requestName
    );
    if (reviewDocument) {
      const matchingReview = reviewDocument.reviews.find(
        (review) => review.reviewer === walletAddress.value
      );
      if (matchingReview) {
        return matchingReview.answers;
      }
    }
  }
  return null;
};

export const populateAnswers = (review, types, reviewObject) => {
  for (let i = 0; i < review.length; i++) {
    reviewObject.reviews[i].answer = review[i];
    if (types[i] === "0") {
      const textArea = document.getElementById("simplemde-" + i);
      if (textArea) {
        textArea.value = review[i];
      }
    }
  }
};
