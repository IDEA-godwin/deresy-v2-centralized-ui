import { ElNotification } from "element-plus";

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
    console.log("Getting review form");

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
    console.log("Getting review forms total");

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
    console.log("Getting request names");

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
  const { name, targetIndex, answers, walletAddress, contractAddress } = params;

  const { methods } = contract;

  let response;

  try {
    console.log("Submitting review");

    const transaction = {
      from: walletAddress,
      to: contractAddress,
      data: methods.submitReview(name, targetIndex, answers).encodeABI(),
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
