import windowsPrinterService from "./services/windows-printer.service.js";

const testPrint = async () => {
  try {
    const filePath = "./test.pdf";
    const printerName = "OneNote for Windows 10";

    console.log("Sending file to printer...");

    await windowsPrinterService.printFile(
      filePath,
      printerName
    );

    console.log("Print test completed.");
  } catch (error) {
    console.log("Print test failed:", error.message);
  }
};

testPrint();