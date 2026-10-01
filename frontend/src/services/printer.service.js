import apiService from "./api.service.js";

const getMyPrinters = async () => {
  try {
    const response = await apiService.get("/printers/my");

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch printers:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const printerService = {
  getMyPrinters,
};

export default printerService;