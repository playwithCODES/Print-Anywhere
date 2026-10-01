import apiService from "./api.service.js";

const register = async (userData) => {
  try {
    const response = await apiService.post(
      "/auth/register",
      userData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await apiService.post(
      "/auth/login",
      credentials
    );

    const data = response.data.data;

    // Save JWT token
    localStorage.setItem("token", data.token);

    // Save logged-in user
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    return response.data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getToken = () => {
  return localStorage.getItem("token");
};

const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

const authService = {
  register,
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
};

export default authService;