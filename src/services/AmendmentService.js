import { db } from "@/firebase";
import { AMENDMENTS_COLLECTION } from "@/constants/collections";

const amendmentsRef = db.collection(AMENDMENTS_COLLECTION);

export async function getReviewAmendments(requestNames, hypercertID) {
  let response;
  let error;
  try {
    const snapshot = await amendmentsRef
      .where("requestName", "in", requestNames)
      .where("hypercertID", "==", hypercertID)
      .get();
    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}