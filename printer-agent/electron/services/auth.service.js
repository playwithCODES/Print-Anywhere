import apiService from "./api.service.js";

const login = async (email, password) => {
  const response = await apiService.post("/auth/login", {
    email,
    password,
  });

  const data = response.data.data;

  return {
    token: data.token,
    user: data.user,
  };
};

const register = async (name, email, password) => {
  const response = await apiService.post("/auth/register", {
    name,
    email,
    password,
  });

  const data = response.data.data;

  return {
    token: data.token,
    user: data.user,
  };
};

export default {
  login,
  register,
};