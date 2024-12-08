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

export const formatDisplayDateValue = (from, to) => {
  console.log(Number.parseInt(from))
  let date = new Date(1733650799 * 1000)
  console.log(`${data.getFullYear()}-${date.getMonth()}-${date.getDay()}`)
  let toDate = new Date(Number.parseInt(to) * 1000)

  return`${buildDateFormat(fromDate)} → ${buildDateFormat(toDate)}`
}

const buildDateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()}`
