import { BrowserWindow } from "electron";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const getLocalPrinters = async () => {
  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");

    const execFileAsync = promisify(execFile);

    const command = `
      Get-Printer |
      Select-Object Name, PrinterStatus, Default, PortName, DriverName |
      ConvertTo-Json -Compress
    `;

    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-Command", command],
      {
        windowsHide: true,
      }
    );

    if (!stdout.trim()) {
      return [];
    }

    const printers = JSON.parse(stdout);

    const printerList = Array.isArray(printers)
      ? printers
      : [printers];

    return printerList.map((printer) => ({
      name: printer.Name,
      status: printer.PrinterStatus,
      isDefault: Boolean(printer.Default),
      portName: printer.PortName,
      driverName: printer.DriverName,
    }));
  } catch (error) {
    console.error(
      "Failed to detect local printers:",
      error.message
    );

    throw error;
  }
};

const printFile = async (
  filePath,
  printerName,
  copies = 1
) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  if (!printerName) {
    throw new Error("Printer name is required");
  }

  try {
    console.log(
      `Preparing PDF for printing: ${filePath}`
    );

    console.log(
      `Target printer: ${printerName}`
    );

    const printWindow = new BrowserWindow({
      show: false,

      webPreferences: {
        sandbox: false,
      },
    });

    try {
      const fileUrl = pathToFileURL(filePath).href;

      await printWindow.loadURL(fileUrl);

      console.log("PDF loaded into Electron");

      await new Promise((resolve, reject) => {
        printWindow.webContents.print(
          {
            silent: true,
            deviceName: printerName,
            copies,
            usePrinterDefaultPageSize: true,
          },
          (success, failureReason) => {
            if (!success) {
              reject(
                new Error(
                  failureReason ||
                    "Electron printing failed"
                )
              );

              return;
            }

            resolve();
          }
        );
      });

      console.log(
        `Print command sent: ${filePath} -> ${printerName}`
      );

      return {
        success: true,
        message: "Print command sent successfully",
      };
    } finally {
      if (!printWindow.isDestroyed()) {
        printWindow.close();
      }
    }
  } catch (error) {
    console.error(
      "Failed to print file:",
      error.message
    );

    throw error;
  }
};

export default {
  getLocalPrinters,
  printFile,
};