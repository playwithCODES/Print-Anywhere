import PrintJob from "../models/PrintJob.js";
import Printer from "../models/Printer.js";

const createPrintJob = async ({
  userId,
  printerId,
  fileName,
  fileUrl,
  copies,
}) => {
  const printer = await Printer.findOne({
    printerId,
    owner: userId,
  });

  if (!printer) {
    throw new Error("Printer not found");
  }

  if (printer.status !== "online") {
    throw new Error("Printer is offline");
  }

  const printJob = await PrintJob.create({
    user: userId,
    printer: printer._id,
    fileName,
    fileUrl,
    copies: copies || 1,
    status: "queued",
  });

  return printJob;
};

const getMyPrintJobs = async (userId) => {
  const printJobs = await PrintJob.find({
    user: userId,
  })
    .populate("printer", "name printerId status")
    .sort({
      createdAt: -1,
    });

  return printJobs;
};

const updatePrintJobStatus = async (jobId, userId, status) => {
  const allowedStatuses = [
    "queued",
    "printing",
    "completed",
    "failed",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid print job status");
  }

  const updateData = {
    status,
  };

  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  const printJob = await PrintJob.findOneAndUpdate(
    {
      _id: jobId,
      user: userId,
    },
    updateData,
    {
      new: true,
    }
  );

  if (!printJob) {
    throw new Error("Print job not found");
  }

  return printJob;
};

const getQueuedPrintJobs = async (printerId, userId) => {
  const printer = await Printer.findOne({
    printerId,
    owner: userId,
  });

  if (!printer) {
    throw new Error("Printer not found");
  }

  const printJobs = await PrintJob.find({
    printer: printer._id,
    status: "queued",
  }).sort({
    createdAt: 1,
  });

  return printJobs;
};

export default {
  createPrintJob,
  getMyPrintJobs,
  updatePrintJobStatus,
  getQueuedPrintJobs,
};
