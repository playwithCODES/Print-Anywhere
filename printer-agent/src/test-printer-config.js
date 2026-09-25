import printerConfigService from "./services/printer-config.service.js";

const testPrinterConfig = () => {
  const printerName = "Canon MF3010";

  const saved = printerConfigService.savePrinter(printerName);

  console.log("Printer saved successfully:");
  console.log(saved);

  const printer = printerConfigService.getPrinter();

  console.log("Saved printer:");
  console.log(printer);
};

testPrinterConfig();