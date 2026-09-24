import Printer from "../models/Printer.js";
import crypto from "crypto";

const registerPrinter = async (data, userId) => {
  const { name, printerId } = data;

  const existingPrinter = await Printer.findOne({ printerId });

  if (existingPrinter) {
    throw new Error("Printer already registered");
  }

  const printerToken = crypto.randomBytes(32).toString("hex");

  const printerTokenHash = crypto
    .createHash("sha256")
    .update(printerToken)
    .digest("hex");

  const printer = await Printer.create({
    name,
    printerId,
    owner: userId,
    status: "offline",
    lastSeen: null,
    printerTokenHash,
  });

  return {
    printer,
    printerToken,
  };
};

const getMyPrinters = async (userId) => {
  const printers = await Printer.find({ owner: userId });

  return printers;
};

const updateHeartbeat = async (printerId, userId) => {
  const printer = await Printer.findOneAndUpdate(
    {
      printerId,
      owner: userId,
    },
    {
      status: "online",
      lastSeen: new Date(),
    },
    {
      new: true,
    }
  );

  if (!printer) {
    throw new Error("Printer not found");
  }

  return printer;
};

const checkPrinterStatus = async () => {
  const timeout = 2 * 60 * 1000; // 2 minutes

  const cutoffTime = new Date(Date.now() - timeout);

  await Printer.updateMany(
    {
      status: "online",
      lastSeen: { $lt: cutoffTime },
    },
    {
      status: "offline",
    }
  );
};

export default {
  registerPrinter,
  getMyPrinters,
  updateHeartbeat,
  checkPrinterStatus,
};

