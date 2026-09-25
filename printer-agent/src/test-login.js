import authService from "./services/auth.service.js";
import authConfig from "./config/auth.config.js";

const testLogin = async () => {
  try {
    const result = await authService.login(
      "omprakashrajbanshi627@gmail.com",
      "123456"
    );

    console.log("Login successful");

    authConfig.setToken(result.token);

    console.log("Token stored successfully");
  } catch (error) {
    console.log(
      "Login failed:",
      error.response?.data?.message || error.message
    );
  }
};

testLogin();