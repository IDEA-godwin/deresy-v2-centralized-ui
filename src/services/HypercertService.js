import { db } from "@/firebase";
import { HYPERCERTS_COLLECTION } from "@/constants/collections";
import { Client, cacheExchange, fetchExchange } from "urql/core";
import { formatDisplayDateValue } from "../utils/utils";

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
          tokenID: token_id
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
    return hypercertsFromQuery.data
      .hypercerts?.data.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
  }
  return []
}

export async function saveHypercert(hypercerts) {
  for (let hypercert of hypercerts) {
    let {id, creation, tokenID, uri} = hypercert
    let metadata = hypercert.metadata
    const processedHypercert = {
      id, creation, tokenID, uri,
      metadata: {
        image: metadata?.image,
        name: metadata?.name,
        description: metadata?.description,
        hypercert: {
          impact_timeframe: { display_value: formatDisplayDateValue(metadata.impact_timeframe_from, metadata.impact_timeframe_to)},
          work_timeframe: { display_value: formatDisplayDateValue(metadata.work_timeframe_from, metadata.work_timeframe_to)},
          work_scope: { display_value: metadata.work_scope },
          impact_scope: { display_value: metadata.impact_scope },
          contributors: { display_value: metadata.contributors },
          rights: { display_value: metadata.rights }
        }},
      name: hypercert.metadata.name,
      processed: 3
    }
    console.log(processedHypercert)
    try {
      const snapshot = await hypercertsRef
        .where('tokenID', '==', hypercert.tokenID)
        .limit(1)
        .get()
      console.log(processedHypercert)
      if (snapshot.empty) {
        await hypercertsRef.add({
          ...processedHypercert,
        })
      } else {
        const document = hypercertsRef.doc(snapshot.docs[0].id)
        await document.update({
          ...processedHypercert,
        })
      }
    } catch (e) {
      console.log(`error saving hypercert: ${e}`)
    }
  }

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
