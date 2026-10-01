import apiService from "./api.service.js";

const getQueuedPrintJobs = async (printerId, token) => {
  try {
    const response = await apiService.get(
      `/print-jobs/queue?printerId=${encodeURIComponent(
        printerId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch queued print jobs:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const updatePrintJobStatus = async (
  jobId,
  status,
  token
) => {
  try {
    const response = await apiService.put(
      `/print-jobs/${jobId}/status`,
      {
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update print job status:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export default {
  getQueuedPrintJobs,
  updatePrintJobStatus,
};