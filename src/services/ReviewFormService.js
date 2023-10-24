import { db } from "@/firebase";
import { REVIEW_FORMS_COLLECTION } from "@/constants/collections";

const reviewFormsRef = db.collection(REVIEW_FORMS_COLLECTION);

export async function getReviewForm(formID) {
  let response;
  let error;
  try {
    const snapshot = await reviewFormsRef
      .where("formID", "==", parseInt(formID))
      .limit(1)
      .get();
    response = snapshot.docs[0].data();
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getAllReviewForms() {
  let response;
  let error;
  try {
    const snapshot = await reviewFormsRef.get();

    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}
