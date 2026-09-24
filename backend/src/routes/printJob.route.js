import express from "express";
import printJobController from "../controllers/printJob.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  printJobController.createPrintJob
);

router.get(
  "/my",
  authMiddleware,
  printJobController.getMyPrintJobs
);

router.put(
  "/:id/status",
  authMiddleware,
  printJobController.updatePrintJobStatus
);

router.get("/queue", authMiddleware, printJobController.getQueuedPrintJobs);

export default router;