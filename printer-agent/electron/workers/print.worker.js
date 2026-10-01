import printJobService from "../services/printjob.service.js";
import downloadService from "../services/download.service.js";
import localPrinterService from "../services/local-printer.service.js";

const startPrintWorker = async ({
  token,
  printerId,
  printerName,
}) => {
  console.log(
    `Print worker started for printer: ${printerName}`
  );

  const processingJobs = new Set();

  const checkQueue = async () => {
    try {
      console.log(
        `Checking queue for printer: ${printerId}`
      );

      const response =
        await printJobService.getQueuedPrintJobs(
          printerId,
          token
        );

      const printJobs = response?.printJobs || [];

      if (printJobs.length === 0) {
        console.log("No pending print jobs");
        return;
      }

      console.log(
        `Found ${printJobs.length} queued print job(s)`
      );

      for (const printJob of printJobs) {
        if (processingJobs.has(printJob._id)) {
          continue;
        }

        processingJobs.add(printJob._id);

        let localFilePath = null;

        try {
          console.log(
            `Starting print job: ${printJob._id}`
          );

          // ==========================================
          // 1. MARK JOB AS PRINTING
          // ==========================================

          await printJobService.updatePrintJobStatus(
            printJob._id,
            "printing",
            token
          );

          console.log(
            `Print job marked as printing: ${printJob._id}`
          );

          // ==========================================
          // 2. DOWNLOAD PDF
          // ==========================================

          localFilePath =
            await downloadService.downloadFile(
              printJob.fileUrl,
              printJob.fileName
            );

          console.log(
            `PDF downloaded: ${localFilePath}`
          );

          // ==========================================
          // 3. PRINT PDF
          // ==========================================

          await localPrinterService.printFile(
            localFilePath,
            printerName,
            printJob.copies
          );

          console.log(
            `Print completed: ${printJob.fileName}`
          );

          // ==========================================
          // 4. MARK JOB AS COMPLETED
          // ==========================================

          await printJobService.updatePrintJobStatus(
            printJob._id,
            "completed",
            token
          );

          console.log(
            `Print job marked as completed: ${printJob._id}`
          );
        } catch (error) {
          console.error(
            `Print job failed: ${printJob._id}`,
            error.response?.data || error.message
          );

          // ==========================================
          // MARK JOB AS FAILED
          // ==========================================

          try {
            await printJobService.updatePrintJobStatus(
              printJob._id,
              "failed",
              token
            );
          } catch (statusError) {
            console.error(
              "Failed to update print job status:",
              statusError.response?.data ||
                statusError.message
            );
          }
        } finally {
          // ==========================================
          // DELETE DOWNLOADED PDF
          // ==========================================

          if (localFilePath) {
            try {
              await downloadService.deleteFile(
                localFilePath
              );

              console.log(
                `Temporary PDF deleted: ${localFilePath}`
              );
            } catch (error) {
              console.error(
                "Failed to delete downloaded PDF:",
                error.message
              );
            }
          }

          processingJobs.delete(printJob._id);
        }
      }
    } catch (error) {
      console.error(
        "Print worker error:",
        error.response?.data || error.message
      );
    }
  };

  await checkQueue();

  const interval = setInterval(
    checkQueue,
    5000
  );

  return () => {
    clearInterval(interval);

    console.log(
      `Print worker stopped for printer: ${printerName}`
    );
  };
};

export default {
  startPrintWorker,
};