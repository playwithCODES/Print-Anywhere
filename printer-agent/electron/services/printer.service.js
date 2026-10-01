import apiService from "./api.service.js";

const registerPrinter = async (printerData, token) => {
  const response = await apiService.post(
    "/printers/register",
    printerData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const getMyPrinters = async (token) => {
  const response = await apiService.get(
    "/printers/my",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const sendHeartbeat = async (
  printerId,
  token
) => {
  const response = await apiService.post(
    "/printers/heartbeat",
    { printerId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export default {
  registerPrinter,
  getMyPrinters,
  sendHeartbeat,
};