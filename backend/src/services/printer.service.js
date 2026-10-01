import Printer from "../models/Printer.js";
import crypto from "crypto";

const registerPrinter = async (data, userId) => {
  const { name, printerId } = data;

  const existingPrinter = await Printer.findOne({ printerId });

  if (existingPrinter) {
    if (existingPrinter.owner.toString() !== userId.toString()) {
      throw new Error("Printer is already registered to another user");
    }

    return {
      printer: existingPrinter,
      printerToken: null,
      alreadyRegistered: true,
    };
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
    alreadyRegistered: false,
  };
};

const getMyPrinters = async (userId) => {
  const printers = await Printer.find({
    owner: userId,
  });

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
  const timeout = 2 * 60 * 1000;

  const cutoffTime = new Date(Date.now() - timeout);

  await Printer.updateMany(
    {
      status: "online",
      lastSeen: {
        $lt: cutoffTime,
      },
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