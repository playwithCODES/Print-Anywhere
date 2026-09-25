import { exec } from "child_process";

const getInstalledPrinters = () => {
  return new Promise((resolve, reject) => {
    const command =
      'powershell -NoProfile -Command "Get-Printer | Select-Object Name, PrinterStatus, Default | ConvertTo-Json"';

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      if (stderr) {
        console.log("PowerShell warning:", stderr);
      }

      try {
        if (!stdout.trim()) {
          return resolve([]);
        }

        const printers = JSON.parse(stdout);

        const printerList = Array.isArray(printers)
          ? printers
          : [printers];

        resolve(printerList);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const printFile = (filePath, printerName) => {
  return new Promise((resolve, reject) => {
    const escapedFilePath = filePath.replace(/'/g, "''");
    const escapedPrinterName = printerName.replace(/'/g, "''");

    const command = `powershell -NoProfile -Command "Start-Process -FilePath '${escapedFilePath}' -Verb PrintTo -ArgumentList '${escapedPrinterName}' -PassThru"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      if (stderr) {
        console.log("PowerShell warning:", stderr);
      }

      console.log("Print command sent to:", printerName);

      resolve(true);
    });
  });
};

export default {
  getInstalledPrinters,
  printFile,
};