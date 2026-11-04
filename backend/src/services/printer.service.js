import Printer from "../models/Printer.js";
import crypto from "crypto";

const deactivateUserPrinters = async (userId) => {
  await Printer.updateMany(
    {
      owner: userId,
      isActive: true,
    },
    {
      isActive: false,
    },
  );
};

const registerPrinter = async (data, userId) => {
  const { name, printerId } = data;

  const existingPrinter = await Printer.findOne({
    printerId,
  });

  if (existingPrinter) {
    const isSameOwner = existingPrinter.owner.toString() === userId.toString();

    if (isSameOwner) {
      existingPrinter.name = name;
      existingPrinter.isActive = true;

      await existingPrinter.save();

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

    existingPrinter.name = name;
    existingPrinter.owner = userId;
    existingPrinter.isActive = true;
    existingPrinter.status = "offline";
    existingPrinter.lastSeen = null;
    existingPrinter.printerTokenHash = printerTokenHash;
    existingPrinter.tokenCreatedAt = new Date();

    await existingPrinter.save();

    return {
      printer: existingPrinter,
      printerToken,
      alreadyRegistered: false,
      reassigned: true,
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
    isActive: true,
    status: "offline",
    lastSeen: null,
    printerTokenHash,
  });

  return {
    printer,
    printerToken,
    alreadyRegistered: false,
    reassigned: false,
  };
};


const getMyPrinters = async (userId) => {
  const printers = await Printer.find({
    owner: userId,
    isActive: true,
  })
    .select("-printerTokenHash")
    .sort({ createdAt: -1 });

  return printers;
};


const removePrinter = async (printerId, userId) => {
  const printer = await Printer.findOneAndUpdate(
    {
      printerId,
      owner: userId,
      isActive: true,
    },
    {
      isActive: false,
      status: "offline",
      lastSeen: null,
    },
    {
      new: true,
    },
  );

  if (!printer) {
    throw new Error("Printer not found or already removed");
  }

  return printer;
};

const updateHeartbeat = async (printerId, userId) => {
  const printer = await Printer.findOneAndUpdate(
    {
      printerId,
      owner: userId,
      isActive: true,
    },
    {
      status: "online",
      lastSeen: new Date(),
    },
    {
      new: true,
    },
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
    },
  );
};

export default {
  registerPrinter,
  getMyPrinters,
  updateHeartbeat,
  checkPrinterStatus,
  removePrinter,
};
