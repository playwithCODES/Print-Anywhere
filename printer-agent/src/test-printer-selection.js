import readline from "readline";
import printerService from "./services/windows-printer.service.js";
import printerConfigService from "./services/printer-config.service.js";

const selectPrinter = async () => {
  try {
    const printers = await printerService.getInstalledPrinters();

    console.log("\nAvailable Printers:\n");

    printers.forEach((printer, index) => {
      console.log(`${index + 1}. ${printer.Name}`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nSelect printer number: ", (answer) => {
      const printerNumber = Number(answer);

      if (
        !printerNumber ||
        printerNumber < 1 ||
        printerNumber > printers.length
      ) {
        console.log("Invalid printer number.");
        rl.close();
        return;
      }

      const selectedPrinter = printers[printerNumber - 1];

      console.log("\nPrinter selected successfully:");
      console.log(selectedPrinter.Name);

      printerConfigService.savePrinter(selectedPrinter.Name);

      console.log("\nPrinter configuration saved successfully.");

      rl.close();
    });
  } catch (error) {
    console.error("Failed to select printer:", error.message);
  }
};

selectPrinter();