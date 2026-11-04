import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import printerController from "../controllers/printer.controller.js";

const router = express.Router();
console.log("PRINTER ROUTER LOADED");


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

router.delete(
  "/:printerId",
  (req, res, next) => {
    console.log("DELETE PRINTER ROUTE HIT:", req.params.printerId);
    next();
  },
  authMiddleware,
  printerController.removePrinter
);

export default router;