import axios from "axios";

import config from "../config/config.js";

const apiService = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiService;