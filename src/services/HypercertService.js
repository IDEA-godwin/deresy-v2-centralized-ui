import { db } from "@/firebase";
import { HYPERCERTS_COLLECTION } from "@/constants/collections";

const hypercertsRef = db.collection(HYPERCERTS_COLLECTION);

export async function getHypercert(tokenID) {
  let response;
  let error;
  try {
    const snapshot = await hypercertsRef.where("tokenID", "==", tokenID).get();

    response = snapshot.docs[0].data();
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getProcessedHypercerts() {
  let response;
  let error;
  try {
    const snapshot = await hypercertsRef.where("processed", "==", 3).get();

    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}
