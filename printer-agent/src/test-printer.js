import printerService from "./services/windows-printer.service.js";

const testPrinters = async () => {
  try {
    const printers = await printerService.getInstalledPrinters();

    console.log("Installed Printers:");
    console.log(printers);
  } catch (error) {
    console.log("Failed to detect printers:", error.message);
  }
};

testPrinters();