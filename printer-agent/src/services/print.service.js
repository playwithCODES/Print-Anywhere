import fs from "fs";
import path from "path";
import apiService from "./api.service.js";

const getPrintQueue = async (printerId) => {
  try {
    const response = await apiService.get(
      `/print-jobs/queue?printerId=${encodeURIComponent(printerId)}`
    );

    return response.data.printJobs;
  } catch (error) {
    console.log(
      "Failed to fetch print queue:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const updatePrintJobStatus = async (jobId, status) => {
  try {
    const response = await apiService.put(
      `/print-jobs/${jobId}/status`,
      {
        status,
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Failed to update print job status:",
      error.response?.data || error.message
    );

    throw error;
  }
};

const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const filePath = path.join(process.cwd(), fileName);

    fs.writeFileSync(filePath, buffer);

    console.log("File downloaded:", filePath);

    return filePath;
  } catch (error) {
    console.log("Failed to download file:", error.message);

    throw error;
  }
};

export default {
  getPrintQueue,
  updatePrintJobStatus,
  downloadFile,
};