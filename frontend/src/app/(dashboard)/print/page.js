
"use client";

import { useEffect, useRef, useState } from "react";
import printerService from "@/services/printer.service.js";
import uploadService from "@/services/upload.service.js";
import printJobService from "@/services/printjob.service.js";

export default function PrintPage() {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [copies, setCopies] = useState("1");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadPrinters = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await printerService.getMyPrinters();

        const userPrinters = Array.isArray(response?.printers)
          ? response.printers.filter(
              (printer) => printer?.isActive === true
            )
          : [];

        setPrinters(userPrinters);

        const firstOnlinePrinter = userPrinters.find(
          (printer) => printer.status === "online"
        );

        setSelectedPrinterId(
          firstOnlinePrinter?.printerId || ""
        );
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

  const selectedPrinter = printers.find(
    (printer) => printer.printerId === selectedPrinterId
  );

  const onlinePrinters = printers.filter(
    (printer) => printer.status === "online"
  );

  const handlePrinterChange = (event) => {
    setSelectedPrinterId(event.target.value);
    setError("");
    setMessage("");
  };

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

  const handleRemoveFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setMessage("");
  };

  const handleCopiesChange = (event) => {
    setCopies(event.target.value);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedPrinterId) {
      setError("Please select an online printer.");
      return;
    }

    if (!selectedPrinter || selectedPrinter.status !== "online") {
      setError("Selected printer is offline.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    const copyCount = Number(copies);

    if (!Number.isInteger(copyCount) || copyCount < 1) {
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
        printerId: selectedPrinterId,
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        copies: copyCount,
      });

      setMessage(
        `Print job created successfully for ${selectedPrinter.name}.`
      );

      setSelectedFile(null);
      setCopies("1");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
              Select a printer and send your PDF document.
            </p>
          </div>

          {/* Printer Selection */}
          <div className="mb-6">
            <label
              htmlFor="printer"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Printer
            </label>

            {loading ? (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                Loading printers...
              </div>
            ) : onlinePrinters.length > 0 ? (
              <select
                id="printer"
                value={selectedPrinterId}
                onChange={handlePrinterChange}
                disabled={sending}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  Choose a printer
                </option>

                {printers.map((printer) => (
                  <option
                    key={printer.printerId}
                    value={printer.printerId}
                    disabled={printer.status !== "online"}
                  >
                    {printer.name} -{" "}
                    {printer.status === "online" ? "Online" : "Offline"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  No online printer available
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Connect a printer through the Printer Agent first.
                </p>
              </div>
            )}
          </div>

          {/* Selected Printer Details */}
          {selectedPrinter && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Selected Printer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedPrinter.name}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Online
                </span>
              </div>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PDF Upload */}
            <div>
              <label
                htmlFor="document"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                PDF Document
              </label>

              <input
                ref={fileInputRef}
                id="document"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={sending || loading}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
              />

              {selectedFile && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={sending}
                    className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Copies */}
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
                !selectedPrinterId ||
                !selectedPrinter ||
                selectedPrinter.status !== "online"
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Print Document"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
