import { db } from "@/firebase";
import { REVIEWS_COLLECTION } from "@/constants/collections";

const reviewsRef = db.collection(REVIEWS_COLLECTION);

export async function getReviews(requestName) {
  let response;
  let error;
  try {
    const snapshot = await reviewsRef
      .where("requestName", "==", requestName)
      .limit(1)
      .get();
    response = snapshot.docs[0].data();
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getAllReviews() {
  let response;
  let error;
  try {
    const snapshot = await reviewsRef.get();
    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getReviewByAttestationID(hypercertID, attestationID) {
  let response;
  let error;
  try {
    const snapshot = await reviewsRef.get();

    if (snapshot.empty) {
      return { response, error };
    } else {
      const allReviews = snapshot.docs.map((doc) => doc.data());
      for (const review of allReviews) {
        const matchingReview = review.reviews?.find((reviewItem) => {
          return (
            reviewItem.hypercertID === hypercertID &&
            reviewItem.attestationID === attestationID
          );
        });

        if (matchingReview) {
          response = {
            ...matchingReview,
            requestName: review.requestName,
            systemVersion: review.systemVersion,
          };
        }
      }
    }
  } catch (e) {
    error = e;
  }

  return { response, error };
}
