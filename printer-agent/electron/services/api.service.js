import axios from "axios";

import config from "../config/config.js";

const apiService = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use((config) => {
  console.log("AGENT API REQUEST:", {
    baseURL: config.baseURL,
    method: config.method,
    url: config.url,
  });

  return config;
});

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AGENT API ERROR:", {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default apiService;