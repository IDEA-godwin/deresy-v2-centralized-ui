import { ElNotification } from "element-plus";
import {
  EAS_CONTRACT_ABI,
  EAS_CONTRACT_ADDRESS,
} from "../constants/contractConstants";

const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

export const sendTransactionNotification = (txHash, title) => {
  const txURL =
    process.env.NODE_ENV === "production"
      ? `https://arbiscan.io/tx/${txHash}`
      : `https://testnet.arbiscan.io//tx/${txHash}`;

  ElNotification({
    title,
    dangerouslyUseHTMLString: true,
    message: `<a href="${txURL}" target="_blank">View Transaction</a>`,
    type: "warning",
    duration: notificationTime,
  });
};

export const getContract = async (web3, contractABI, contractAddress) => {
  return new web3.eth.Contract(contractABI, contractAddress);
};

export const createReviewForm = async (web3, contract, params) => {
  const { questions, types, choices, contractAddress, walletAddress } = params;
  const { methods } = contract;

  let response;

  try {
    console.log("Creating review form");

    const transaction = {
      from: walletAddress,
      to: contractAddress,
      data: methods.createReviewForm(questions, choices, types).encodeABI(),
    };

    await web3.eth
      .sendTransaction(transaction)
      .on("transactionHash", (txHash) => {
        sendTransactionNotification(txHash, "Transaction in progress");
      })
      .on("receipt", (receipt) => {
        response = receipt;
      });
  } catch (e) {
    console.error("An error ocurred while creating review form.", e);
    throw e;
  }

  return response;
};

export const getReviewForm = async (params) => {
  const { contractMethods, reviewFormIndex } = params;
  try {
    const response = await contractMethods
      .getReviewForm(reviewFormIndex)
      .call();

    return response;
  } catch (e) {
    console.error("An error ocurred while getting the review form.", e);
    throw e;
  }
};

export const getReviewFormsTotal = async (params) => {
  const { contractMethods } = params;
  try {
    const response = contractMethods.reviewFormsTotal().call();

    return response;
  } catch (e) {
    console.error("An error ocurred while getting the review form.", e);
    throw e;
  }
};

export const createRequest = async (web3, contract, params) => {
  const {
    name,
    reviewFormIndex,
    targets,
    targetHashes,
    reviewers,
    requestHash,
    rewardPerReview,
    totalReward,
    contractAddress,
    walletAddress,
  } = params;
  const { methods } = contract;

  let response;

  try {
    console.log("Creating review form");

    const transaction = {
      from: walletAddress,
      to: contractAddress,
      value: totalReward,
      data: methods
        .createRequest(
          name,
          reviewers,
          targets,
          targetHashes,
          requestHash,
          rewardPerReview,
          reviewFormIndex
        )
        .encodeABI(),
    };

    await web3.eth
      .sendTransaction(transaction)
      .on("transactionHash", (txHash) => {
        sendTransactionNotification(txHash, "Transaction in progress");
      })
      .on("receipt", (receipt) => {
        response = receipt;
      });
  } catch (e) {
    console.error("An error ocurred while creating review form.", e);
    throw e;
  }

  return response;
};

export const getRequest = async (params) => {
  const { requestName, contractMethods } = params;
  try {
    console.log("Getting request");

    const response = contractMethods.getRequest(requestName).call();

    return response;
  } catch (e) {
    console.error("An error ocurred while getting the request.", e);
    throw e;
  }
};

export const getRequestNames = async (params) => {
  const { contractMethods } = params;
  try {
    const response = contractMethods.getReviewRequestsNames().call();

    return response;
  } catch (e) {
    console.error("An error ocurred while getting the requests names.", e);
    throw e;
  }
};

export const closeRequest = async (web3, contract, params) => {
  const { requestName, contractAddress, walletAddress } = params;
  const { methods } = contract;

  let response;

  try {
    console.log("Closing review request");

    const transaction = {
      from: walletAddress,
      to: contractAddress,
      data: methods.closeReviewRequest(requestName).encodeABI(),
    };

    await web3.eth
      .sendTransaction(transaction)
      .on("transactionHash", (txHash) => {
        sendTransactionNotification(txHash, "Transaction in progress");
      })
      .on("receipt", (receipt) => {
        response = receipt;
      });
  } catch (e) {
    console.error("An error ocurred while closing the review request.", e);
    throw e;
  }

  return response;
};

export const submitReview = async (web3, contract, params) => {
  const { name, hypercertID, answers, walletAddress } = params;

  const { methods } = contract;
  const { eth } = web3;

  const easContract = new eth.Contract(EAS_CONTRACT_ABI, EAS_CONTRACT_ADDRESS, {
    from: walletAddress,
  });

  let response;

  try {
    const requestReviewForm = await methods.getRequestReviewForm(name).call();

    // Fixed positions based on smart-contract
    const pdfRequestData = {
      name: name,
      accountID: walletAddress,
      hypercertID: hypercertID,
      easSchemaID: requestReviewForm[3],
      questions: requestReviewForm[0],
      questionOptions: requestReviewForm[2],
      answers: answers,
    };

    const pdfResponse = await fetch(
      process.env.VUE_APP_CLOUD_FUNCTIONS_BASE_URL + "/generate_pdf",
      {
        method: "POST",
        body: JSON.stringify(pdfRequestData),
      }
    );

    const pdfData = await pdfResponse?.json();

    const ipfsHashID = pdfData?.IpfsHash;

    const abi = [
      { type: "string", name: "requestName" },
      { type: "uint256", name: "hypercertID" },
      { type: "string[]", name: "answers" },
      { type: "string", name: "pdfIpfsHash" },
    ];

    const encodedData = web3.eth.abi.encodeParameters(abi, [
      name,
      hypercertID,
      answers,
      ipfsHashID,
    ]);

    const data = await easContract.methods
      .attest({
        schema: requestReviewForm[3],
        data: {
          recipient: "0x0000000000000000000000000000000000000000",
          expirationTime: 0n,
          revocable: false,
          refUID:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData,
          value: 0,
        },
      })
      .encodeABI();

    const transaction = {
      from: walletAddress,
      to: EAS_CONTRACT_ADDRESS,
      data,
    };

    await web3.eth
      .sendTransaction(transaction)
      .on("transactionHash", (txHash) => {
        sendTransactionNotification(txHash, "Transaction in progress");
      })
      .on("receipt", (receipt) => {
        response = receipt;
      });
  } catch (e) {
    console.error("An error ocurred while submitting the review.", e);
    throw e;
  }

  return response;
};
