import { getAllReviews } from "@/services/ReviewService";

export const filterReviewRequests = (
  reviewRequests,
  hypercertID,
  reviewFormName,
  walletAddress,
  requestName
) => {
  return reviewRequests.filter((request) => {
    return (
      request.hypercertTargetIDs.includes(hypercertID) &&
      request.reviewFormName === reviewFormName &&
      request.reviewers.includes(walletAddress.value) &&
      request.requestName !== requestName
    );
  });
};

export const getMatchingReview = async (
  filteredRequests,
  walletAddress,
  reviewFormName
) => {
  const reviews = await getAllReviews();

  if (reviews.response.length == 0) {
    return null;
  }

  let matchingReviews = [];

  for (const request of filteredRequests) {
    const reviewDocument = reviews.response.find(
      (review) => review.requestName === request.requestName
    );

    if (reviewDocument) {
      const matchingReview = reviewDocument.reviews.filter(
        (review) =>
          review.reviewer === walletAddress.value &&
          request.reviewFormName == reviewFormName
      );

      if (matchingReview) {
        matchingReviews.push(...matchingReview);
      }
    }
  }

  matchingReviews.sort((a, b) => b.createdAt - a.createdAt);

  if (matchingReviews.length > 0) {
    return matchingReviews[0].answers;
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
