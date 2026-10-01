import printer from "pdf-to-printer";

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

  if (!Number.isInteger(copies) || copies < 1) {
    throw new Error("Copies must be at least 1");
  }

  try {
    console.log(
      `Preparing PDF for printing: ${filePath}`
    );

    console.log(
      `Target printer: ${printerName}`
    );

    console.log(
      `Copies: ${copies}`
    );

    await printer.print(filePath, {
      printer: printerName,
      copies,
    });

    console.log(
      `Print command sent: ${filePath} -> ${printerName}`
    );

    return {
      success: true,
      message: "Print command sent successfully",
    };
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