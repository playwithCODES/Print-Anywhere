import crypto from "crypto";
import os from "os";

import localPrinterService from "./local-printer.service.js";
import printerService from "./printer.service.js";

const createPrinterId = (printer) => {
  const machineName = os.hostname();

  const identity = `${machineName}:${printer.name}`;

  return crypto
    .createHash("sha256")
    .update(identity)
    .digest("hex");
};

const getLocalPrinters = async () => {
  return localPrinterService.getLocalPrinters();
};

const registerLocalPrinter = async (
  printer,
  token
) => {
  if (!printer?.name) {
    throw new Error(
      "Printer name is required"
    );
  }

  if (!token) {
    throw new Error(
      "Authentication token is required"
    );
  }

  const printerId = createPrinterId(printer);

  const printerData = {
    name: printer.name,
    printerId,
  };

  const response =
    await printerService.registerPrinter(
      printerData,
      token
    );

  const registeredPrinter =
    response?.data?.printer ||
    response?.printer;

  if (!registeredPrinter) {
    throw new Error(
      "Backend did not return the registered printer"
    );
  }

  return registeredPrinter;
};

export default {
  getLocalPrinters,
  registerLocalPrinter,
};