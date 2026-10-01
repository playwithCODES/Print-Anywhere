import apiService from "./api.service.js";

const getMyPrintJobs = async () => {
  try {
    const response = await apiService.get("/print-jobs/my");

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch print jobs:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const createPrintJob = async (jobData) => {
  try {
    const response = await apiService.post("/print-jobs", jobData);

    return response.data;
  } catch (error) {
    console.error(
      "Failed to create print job:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const getPrintJobById = async (id) => {
  try {
    const response = await apiService.get(`/print-jobs/${id}`);

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch print job:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const printJobService = {
  getMyPrintJobs,
  createPrintJob,
  getPrintJobById,
};

export default printJobService;