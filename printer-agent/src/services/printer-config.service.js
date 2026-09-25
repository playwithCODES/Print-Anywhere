import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "printer-config.json");

const savePrinter = (printerId, printerName) => {
  const config = {
    printerId,
    printerName,
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  return config;
};

const getPrinter = () => {
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const config = fs.readFileSync(configPath, "utf-8");

  return JSON.parse(config);
};

export default {
  savePrinter,
  getPrinter,
};