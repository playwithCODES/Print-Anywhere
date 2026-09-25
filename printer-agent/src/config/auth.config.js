let token = null;

const setToken = (newToken) => {
  token = newToken;
};

const getToken = () => {
  return token;
};

const clearToken = () => {
  token = null;
};

export default {
  setToken,
  getToken,
  clearToken,
};