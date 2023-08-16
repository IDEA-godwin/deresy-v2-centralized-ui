import axios from "axios";

export const client = axios.create({
  baseURL: process.env.VUE_APP_CLOUD_FUNCTIONS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
