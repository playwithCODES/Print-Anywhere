import authService from "./auth.service.js";
import authConfig from "../config/auth.config.js";
import printerRegistrationService from "./printer-registration.service.js";
import printerConfigService from "./printer-config.service.js";
import windowsPrinterService from "./windows-printer.service.js";

const loginAgent = async () => {
  try {
    const email = process.env.AGENT_EMAIL;
    const password = process.env.AGENT_PASSWORD;

    const result = await authService.login(email, password);

    authConfig.setToken(result.data.token);

    console.log("Agent login successful.");

    const existingPrinter = printerConfigService.getPrinter();

    if (existingPrinter) {
      console.log("Printer already registered:", existingPrinter.printerId);

      await printerRegistrationService.updateHeartbeat(
        existingPrinter.printerId,
      );

      console.log("Printer heartbeat updated.");

      return true;
    }

    const printers = await windowsPrinterService.getInstalledPrinters();

    if (!printers || printers.length === 0) {
      throw new Error("No Windows printer found.");
    }

    const selectedPrinter = printers[0];

    console.log("Registering Windows printer:", selectedPrinter.Name);

    const registration = await printerRegistrationService.registerPrinter(
      selectedPrinter.Name,
    );

    const printerId = registration.printer.printerId;

    printerConfigService.savePrinter(printerId, selectedPrinter.Name);

    console.log("Printer registered:", printerId);

    return true;
  } catch (error) {
    console.log(
      "Agent startup failed:",
      error.response?.data?.message || error.message,
    );

    return false;
  }
};

export default {
  loginAgent,
};
