import axios from "axios";
import config from "../config/config.js";
import authConfig from "../config/auth.config.js";

const api = axios.create({
  baseURL: config.API_URL,
});

api.interceptors.request.use((request) => {
  const token = authConfig.getToken();

  console.log("API REQUEST:", request.url);
  console.log("TOKEN FROM AUTH CONFIG:", token);

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  console.log("AUTHORIZATION HEADER:", request.headers.Authorization);

  return request;
});

export default api;