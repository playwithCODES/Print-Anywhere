import fs from "fs";
import path from "path";
import apiService from "./api.service.js";

const SPOOL_DIR = path.join(
  process.env.ProgramData || "C:\\ProgramData",
  "PrintAnywhere",
  "spool"
);

const POLL_INTERVAL_MS = 2500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeFileName = (rawTitle, fallbackBase) => {
  const title = String(rawTitle || "").trim();
  const effectiveTitle =
    !title || /^about:blank$/i.test(title) ? fallbackBase : title;

  const cleaned = effectiveTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .trim();

  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
};

const startSpoolWatcher = (getActiveContext, onJobEvent) => {
  fs.mkdirSync(SPOOL_DIR, { recursive: true });

  const processing = new Set();
  let stopped = false;

  const processJob = async (jsonFileName) => {
    if (stopped || processing.has(jsonFileName)) return;

    const baseName = path.basename(jsonFileName, ".json");
    const jsonPath = path.join(SPOOL_DIR, jsonFileName);
    const pdfPath = path.join(SPOOL_DIR, `${baseName}.pdf`);

    if (!fs.existsSync(jsonPath) || !fs.existsSync(pdfPath)) return;

    const { token, user, targetPrinter } = getActiveContext() || {};
    if (!token || !targetPrinter?.printerId) {
      return;
    }

    processing.add(jsonFileName);

    try {
      await sleep(300);

      const stats = await fs.promises.stat(pdfPath);
      if (stats.size === 0) return;

      const rawJson = await fs.promises.readFile(jsonPath, "utf8");
      const meta = JSON.parse(rawJson.replace(/^\uFEFF/, ""));

      const rawTitle =
        meta.documentName ||
        meta.DocumentName ||
        meta.jobName ||
        meta.JobName ||
        meta.fileName ||
        meta.FileName ||
        baseName;

      const fileName = sanitizeFileName(rawTitle, baseName);
      const rawCopies = Number(meta.copies ?? meta.Copies ?? 1);
      const copies =
        Number.isFinite(rawCopies) && rawCopies > 0
          ? Math.floor(rawCopies)
          : 1;

      onJobEvent?.({
        type: "uploading",
        message: `Sending "${fileName}" to ${targetPrinter.name} (${user?.email})...`,
      });

      const uploaded = await apiService.uploadPdf(pdfPath, fileName, token);
      if (!uploaded?.fileUrl) {
        throw new Error("Missing fileUrl from upload response");
      }

      const jobRes = await apiService.createPrintJob(
        {
          printerId: targetPrinter.printerId,
          fileName,
          fileUrl: uploaded.fileUrl,
          copies,
        },
        token
      );

      onJobEvent?.({
        type: "success",
        message: `Sent "${fileName}" -> ${targetPrinter.name} (${user?.email})`,
        jobId: jobRes?.printJob?._id,
      });

      await fs.promises.unlink(jsonPath).catch(() => {});
      await fs.promises.unlink(pdfPath).catch(() => {});
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      onJobEvent?.({
        type: "error",
        message: `Failed (${jsonFileName}): ${msg}`,
      });
    } finally {
      processing.delete(jsonFileName);
    }
  };

  const scan = async () => {
    if (stopped) return;
    try {
      const files = await fs.promises.readdir(SPOOL_DIR);
      for (const file of files.filter((f) => f.endsWith(".json")).sort()) {
        if (stopped) break;
        await processJob(file);
      }
    } catch (err) {
      console.error("[SpoolWatcher] Scan error:", err.message);
    }
  };

  let watcher = null;
  try {
    watcher = fs.watch(SPOOL_DIR, (_, filename) => {
      if (!stopped && filename && filename.endsWith(".json")) {
        processJob(filename);
      }
    });
  } catch {
    // Fallback to interval polling
  }

  const timer = setInterval(scan, POLL_INTERVAL_MS);
  scan();

  return () => {
    stopped = true;
    clearInterval(timer);
    if (watcher) watcher.close();
  };
};

export default {
  startSpoolWatcher,
};