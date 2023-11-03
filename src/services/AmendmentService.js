import { db } from "@/firebase";
import { AMENDMENTS_COLLECTION } from "@/constants/collections";

const amendmentsRef = db.collection(AMENDMENTS_COLLECTION);

export async function getReviewAmendments(tokenID) {
  let response;
  let error;
  try {
    const snapshot = await amendmentsRef
      .where("hypercertID", "==", tokenID)
      .get();

    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getAmendmentsByRefUID(refUID) {
  let response;
  let error;
  try {
    const snapshot = await amendmentsRef.where("refUID", "==", refUID).get();
    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}
