import { db } from "@/firebase";
import { HYPERCERTS_COLLECTION } from "@/constants/collections";
import { Client, cacheExchange, fetchExchange } from "urql/core";

const hypercertsRef = db.collection(HYPERCERTS_COLLECTION);

export async function searchHypercert(name) {
  const query = `
    query searchHypercert($hypercertName: String) {
      hypercerts(
        where: { metadata: { name: { contains: $hypercertName }} }
      ) {
        count
        data {
          id: hypercert_id
          creation: creation_block_timestamp
          token_id
          uri
          metadata {
            name
            description
            impact_scope
            impact_timeframe_from
            impact_timeframe_to
            work_scope
            work_timeframe_from
            work_timeframe_to
            contributors
            rights
            image
          }
        }
      }
    }
  `
  const url = 'https://api.hypercerts.org/v1/graphql'
  const client = new Client({
    url, exchanges: [cacheExchange, fetchExchange],
  })
  let hypercertsFromQuery = await client.query(query, {
    hypercertName: name,
  })
  console.log(hypercertsFromQuery)
  if (
    hypercertsFromQuery &&
    hypercertsFromQuery.data &&
    hypercertsFromQuery.data.hypercerts &&
    hypercertsFromQuery.data.hypercerts.count > 0
  ) {
    return hypercertsFromQuery.data.hypercerts?.data.map(cert => ({
      id: cert.id,
      creation: cert.creation_block_timestamp,
      uri: cert.metadata.uri,
      tokenID: cert.token_id,
      name: cert.metadata.name
    })).sort((a, b) => a.name.localeCompare(b.name))
  }
  return []
}

export async function saveHypercert(hypercert) {
  const processedHypercert = {
    ...hypercert,
    processed: 3
  }
  await hypercertsRef.add()
}

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
