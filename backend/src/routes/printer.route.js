import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import printerController from "../controllers/printer.controller.js";

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  printerController.registerPrinter
);

router.get(
  "/my",
  authMiddleware,
  printerController.getMyPrinters
);

router.post(
  "/heartbeat",
  authMiddleware,
  printerController.updateHeartbeat
);

export default router;