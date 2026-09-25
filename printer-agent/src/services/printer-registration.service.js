import crypto from "crypto";
import apiService from "./api.service.js";

const registerPrinter = async (name) => {
  try {
    const printerId = `printer-${crypto.randomBytes(4).toString("hex")}`;

    const response = await apiService.post("/printers/register", {
      name,
      printerId,
    });

    return response.data;
  } catch (error) {
    console.log(
      "Failed to register printer:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const updateHeartbeat = async (printerId) => {
  try {
    const response = await apiService.post("/printers/heartbeat", {
      printerId,
    });

    return response.data;
  } catch (error) {
    console.log(
      "Failed to update printer heartbeat:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export default {
  registerPrinter,
  updateHeartbeat,
};