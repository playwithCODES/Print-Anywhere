import express from "express";

import uploadController from "../controllers/upload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  uploadController.uploadDocument
);

export default router;