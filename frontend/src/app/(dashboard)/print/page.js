"use client";

import { useEffect, useState } from "react";
import printerService from "@/services/printer.service.js";
import uploadService from "@/services/upload.service.js";
import printJobService from "@/services/printjob.service.js";

export default function PrintPage() {
  const [printers, setPrinters] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copies, setCopies] = useState("1");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrinters = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await printerService.getMyPrinters();

        const userPrinters = Array.isArray(response?.printers)
          ? response.printers
          : [];

        setPrinters(userPrinters);
      } catch (error) {
        console.error(
          "Failed to load printers:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load printer information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrinters();
  }, []);

  const activePrinter = printers.find(
    (printer) => printer?.isActive === true
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setSelectedFile(null);
      event.target.value = "";
      setError("Only PDF files are allowed.");
      return;
    }

    setSelectedFile(file);
  };

  const handleCopiesChange = (event) => {
    setCopies(event.target.value);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!activePrinter) {
      setError("No active printer is available.");
      return;
    }

    if (activePrinter.status !== "online") {
      setError("The active printer is offline.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    const copyCount = Number(copies);

    if (
      !Number.isInteger(copyCount) ||
      copyCount < 1
    ) {
      setError("Copies must be at least 1.");
      return;
    }

    try {
      setSending(true);
      setMessage("Uploading PDF...");

      const uploadResponse =
        await uploadService.uploadDocument(selectedFile);

      const uploadedFile = uploadResponse.data;

      setMessage("Creating print job...");

      await printJobService.createPrintJob({
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        copies: copyCount,
      });

      setMessage("PDF sent to printer successfully.");

      setSelectedFile(null);
      setCopies("1");

      const fileInput =
        document.getElementById("document");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Failed to create print job:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to send PDF to printer."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Print Document
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Send a PDF to your active printer.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading printer...
            </div>
          ) : activePrinter ? (
            <div
              className={`mb-6 rounded-xl border p-4 ${
                activePrinter.status === "online"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Active Printer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {activePrinter.name}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activePrinter.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {activePrinter.status === "online"
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-semibold text-yellow-800">
                No active printer
              </p>

              <p className="mt-1 text-sm text-yellow-700">
                Please register a printer through the Printer Agent.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                PDF Document
              </label>

              <input
                id="document"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={sending || loading}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
              />

              {selectedFile && (
                <p className="mt-2 text-sm text-slate-500">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="copies"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Copies
              </label>

              <input
                id="copies"
                type="number"
                min="1"
                step="1"
                value={copies}
                onChange={handleCopiesChange}
                disabled={sending || loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={
                sending ||
                loading ||
                !selectedFile ||
                !activePrinter ||
                activePrinter.status !== "online"
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Sending..."
                : "Print Document"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}