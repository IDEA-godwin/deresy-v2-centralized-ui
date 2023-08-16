import { ElMessage } from "element-plus";
import { ElNotification } from "element-plus";

const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);

  ElMessage({
    message: "Copied to Clipboard!",
    type: "success",
  });
};

export const formatAddress = (address) => {
  const length = address.length;
  return `${address.substring(0, 5)}...${address.substring(
    length - 6,
    length - 1
  )}`;
};

export const selectNotification = async (e, notificationType = false) => {
  if (notificationType) {
    ElNotification({
      title: "Success",
      message: "Minting successful.",
      type: "success",
      duration: notificationTime,
    });
  } else {
    if (e.code === 4001) {
      ElNotification({
        title: "Error",
        message: "Minting cancelled.",
        type: "error",
        duration: notificationTime,
      });
    } else if (e.code === -32603) {
      ElNotification({
        title: "Error",
        message: "Error processing TX.",
        type: "error",
        duration: notificationTime,
      });
    } else {
      ElNotification({
        title: "Error",
        message: `Minting failed: ${e.message}`,
        type: "error",
        duration: notificationTime,
      });
    }
  }
};
