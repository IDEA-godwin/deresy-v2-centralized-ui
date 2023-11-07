import { db } from "@/firebase";
import { ATTESTATIONS_COLLECTION } from "@/constants/collections";

const amendmentsRef = db.collection(ATTESTATIONS_COLLECTION);

export async function saveAttestationIdToDB(attestationId) {
  let response;
  let error;

  try {
    const docRef = await amendmentsRef.add({
      attestationId: attestationId,
      createdAt: new Date().toISOString(),
    });

    response = docRef.id;
  } catch (e) {
    console.error(e);

    error = e;
  }

  return { response, error };
}

export async function getAttestationsIDs() {
  let response;
  let error;

  try {
    const snapshot = await amendmentsRef.get();
    const attestations = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    response = attestations.map((attestation) => attestation.attestationId);
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { response, error };
}
