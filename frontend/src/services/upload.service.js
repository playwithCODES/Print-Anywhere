import apiService from "./api.service.js";

const uploadDocument = async (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  const formData = new FormData();

  formData.append("document", file);

  try {
    const response = await apiService.post(
      "/uploads",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to upload document:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export default {
  uploadDocument,
};