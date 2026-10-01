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
    }
  );
};

const registerPrinter = async (data, userId) => {
  const { name, printerId } = data;

  const existingPrinter = await Printer.findOne({
    printerId,
  });

  if (existingPrinter) {
    const isSameOwner =
      existingPrinter.owner.toString() === userId.toString();

    if (isSameOwner) {
      await deactivateUserPrinters(userId);

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

    // Make any other printer of this user inactive.
    await deactivateUserPrinters(userId);

    // Transfer this physical printer to the new user.
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

  // Only one active printer for this user.
  await deactivateUserPrinters(userId);

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

  const cutoffTime = new Date(
    Date.now() - timeout
  );

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