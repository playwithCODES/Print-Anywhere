import uploadService from "../services/upload.service.js";

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF file.",
      });
    }

    const result = await uploadService.uploadDocument(
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Document upload failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload document.",
    });
  }
};

export default {
  uploadDocument,
};