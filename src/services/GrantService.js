import { db } from "@/firebase";
import { GRANTS_COLLECTION } from "@/constants/collections";

const grantsRef = db.collection(GRANTS_COLLECTION);

export async function getGrant(grantID) {
  let response;
  let error;
  try {
    const snapshot = await grantsRef
      .where("id", "==", parseInt(grantID))
      .limit(1)
      .get();
    response = snapshot.docs[0].data();
  } catch (e) {
    error = e;
  }

  return { response, error };
}

export async function getAllGrants() {
  let response;
  let error;
  try {
    const snapshot = await grantsRef.get();
    response = snapshot.docs.map((doc) => doc.data());
  } catch (e) {
    error = e;
  }

  return { response, error };
}
