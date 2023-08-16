import { db } from "@/firebase";
import { REVIEW_REQUESTS_COLLECTION } from "@/constants/collections";

const reviewRequestsRef = db.collection(REVIEW_REQUESTS_COLLECTION);

export async function getReviewRequest(requestName) {
  let response;
  let error;
  try {
    const snapshot = await reviewRequestsRef
      .where("requestName", "==", requestName)
      .limit(1)
      .get();
    response = snapshot.docs[0].data();
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getAllReviewRequests() {
  let response;
  let error;
  try {
    const snapshot = await reviewRequestsRef.get();
    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}
