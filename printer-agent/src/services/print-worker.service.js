import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

import printService from "./print.service.js";
import printerConfigService from "./printer-config.service.js";
import windowsPrinterService from "./windows-printer.service.js";

const POLLING_INTERVAL = 5000;

const downloadPrintFile = async (fileUrl, fileName) => {
  const tempDir = path.join(os.tmpdir(), "print-anywhere");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, fileName);

  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(filePath, response.data);

  return filePath;
};

const checkPrintQueue = async () => {
  try {
    const printer = printerConfigService.getPrinter();

    if (!printer) {
      console.log("No printer configured.");
      return;
    }

    console.log("\nChecking print queue...");

    const printJobs = await printService.getPrintQueue(
      printer.printerId
    );

    if (!printJobs || printJobs.length === 0) {
      console.log("No pending print jobs.");
      return;
    }

    console.log(`Found ${printJobs.length} print job(s).`);

    const job = printJobs[0];

    console.log("Processing print job:", job._id);

    console.log("Downloading file:", job.fileName);

    const filePath = await downloadPrintFile(
      job.fileUrl,
      job.fileName
    );

    console.log("File downloaded:", filePath);

    await printService.updatePrintJobStatus(
      job._id,
      "printing"
    );

    console.log("Print job marked as printing.");

    const printerName = printer.printerName;

    if (!printerName) {
      throw new Error(
        "Windows printer name is not configured."
      );
    }

    console.log("Sending file to printer:", printerName);

    await windowsPrinterService.printFile(
      filePath,
      printerName
    );

    console.log("Print command sent successfully.");

    await printService.updatePrintJobStatus(
      job._id,
      "completed"
    );

    console.log("Print job marked as completed.");

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file deleted.");
    }
  } catch (error) {
    console.error(
      "Print worker error:",
      error.response?.data || error.message
    );
  }
};

const startWorker = () => {
  console.log("Print worker started.");

  const printer = printerConfigService.getPrinter();

  if (printer) {
    console.log("Using printer ID:", printer.printerId);
    console.log(
      "Using Windows printer:",
      printer.printerName || "Not configured"
    );
  } else {
    console.log("No printer configured.");
  }

  checkPrintQueue();

  setInterval(() => {
    checkPrintQueue();
  }, POLLING_INTERVAL);
};

export default {
  startWorker,
  checkPrintQueue,
};