import printJobService from "../services/printJob.service.js";

const createPrintJob = async (req, res) => {
  try {
    const { printerId, fileName, fileUrl, copies } = req.body;

    if (!printerId || !fileName || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Printer ID, file name and file URL are required",
      });
    }

    const printJob = await printJobService.createPrintJob({
      userId: req.user.userId,
      printerId,
      fileName,
      fileUrl,
      copies,
    });

    return res.status(201).json({
      success: true,
      message: "Print job created successfully",
      printJob,
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyPrintJobs = async (req, res) => {
  try {
    const printJobs = await printJobService.getMyPrintJobs(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Print jobs fetched successfully",
      printJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePrintJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const printJob = await printJobService.updatePrintJobStatus(
      req.params.id,
      req.user.userId,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Print job status updated successfully",
      printJob,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getQueuedPrintJobs = async (req, res) => {
  try {
    const { printerId } = req.query;

    if (!printerId) {
      return res.status(400).json({
        success: false,
        message: "Printer ID is required",
      });
    }

    const printJobs = await printJobService.getQueuedPrintJobs(printerId);

    return res.status(200).json({
      success: true,
      message: "Queued print jobs fetched successfully",
      printJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export default {
  createPrintJob,
  getMyPrintJobs,
  updatePrintJobStatus,
  getQueuedPrintJobs,
};