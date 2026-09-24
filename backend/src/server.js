import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.route.js";
import printerRouter from "./routes/printer.route.js";
import printJobRouter from "./routes/printJob.route.js";

import connectDB from "./config/database.js";
import printerService from "./services/printer.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/printers", printerRouter);
app.use("/api/print-jobs", printJobRouter);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Print Anywhere API running on port ${PORT}`);
  });
};

startServer();

setInterval(async () => {
  try {
    await printerService.checkPrinterStatus();
  } catch (error) {
    console.log("Printer status check failed:", error.message);
  }
}, 60 * 1000);