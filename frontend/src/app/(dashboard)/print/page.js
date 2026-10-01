"use client";

import { useEffect, useState } from "react";

import printerService from "@/services/printer.service.js";
import uploadService from "@/services/upload.service.js";
import printJobService from "@/services/printjob.service.js";

export default function PrintPage() {
  const [printers, setPrinters] = useState([]);
  const [printerId, setPrinterId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrinters = async () => {
      try {
        setLoading(true);

        const response =
          await printerService.getMyPrinters();

        setPrinters(response.printers || []);
      } catch (error) {
        console.error(
          "Failed to load printers:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load printers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrinters();
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!printerId) {
      setError("Please select a printer.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setSending(true);

      // ==========================================
      // 1. UPLOAD PDF
      // ==========================================

      setMessage("Uploading PDF...");

      const uploadResponse =
        await uploadService.uploadDocument(
          selectedFile
        );

      const uploadedFile =
        uploadResponse.data;

      // ==========================================
      // 2. CREATE PRINT JOB
      // ==========================================

      setMessage("Creating print job...");

      await printJobService.createPrintJob({
        printerId,
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        copies: 1,
      });

      setMessage(
        "PDF sent to printer successfully."
      );

      setSelectedFile(null);
      setPrinterId("");

      const fileInput =
        document.getElementById("document");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Failed to send PDF:",
        error
      );

      setMessage("");

      setError(
        error.response?.data?.message ||
          "Failed to send PDF to printer."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="
        min-h-[calc(100vh-5rem)]
        bg-slate-100
        px-4
        py-6
        text-slate-900
        transition-colors
        duration-300

        sm:px-6
        sm:py-8

        lg:min-h-[calc(100vh-6rem)]
        lg:px-8
        lg:py-10

        dark:bg-slate-950
        dark:text-white
      "
    >
      <div className="mx-auto w-full max-w-3xl">

        {/* PAGE HEADER */}

        <div className="mb-6 sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white

              sm:text-3xl
            "
          >
            Print Document
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-600
              dark:text-slate-400

              sm:text-base
            "
          >
            Send a PDF document to one of your
            registered printers.
          </p>
        </div>

        {/* FORM CARD */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            transition-colors
            duration-300

            sm:p-6

            lg:p-8

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6"
          >

            {/* PRINTER */}

            <div>
              <label
                htmlFor="printer"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Select Printer
              </label>

              <select
                id="printer"
                value={printerId}
                onChange={(event) =>
                  setPrinterId(event.target.value)
                }
                disabled={loading || sending}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20

                  sm:px-4

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  dark:focus:border-blue-500
                "
              >
                <option value="">
                  {loading
                    ? "Loading printers..."
                    : "Select printer"}
                </option>

                {printers.map((printer) => (
                  <option
                    key={printer._id}
                    value={printer.printerId}
                  >
                    {printer.name}
                    {printer.status === "online"
                      ? " — Online"
                      : " — Offline"}
                  </option>
                ))}
              </select>
            </div>

            {/* DOCUMENT */}

            <div>
              <label
                htmlFor="document"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Select PDF
              </label>

              <label
                htmlFor="document"
                className="
                  flex
                  min-h-48
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  px-4
                  py-8
                  text-center
                  transition

                  hover:border-blue-500
                  hover:bg-blue-50

                  sm:min-h-52
                  sm:px-6
                  sm:py-10

                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:hover:border-blue-500
                  dark:hover:bg-blue-950/20
                "
              >
                <div className="text-4xl">
                  📄
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-slate-800
                    dark:text-slate-200

                    sm:text-base
                  "
                >
                  {selectedFile
                    ? "Change PDF"
                    : "Choose a PDF"}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                    dark:text-slate-400

                    sm:text-sm
                  "
                >
                  PDF files only
                </p>

                <input
                  id="document"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={sending}
                  className="hidden"
                />
              </label>

              {/* SELECTED FILE */}

              {selectedFile && (
                <div
                  className="
                    mt-4
                    flex
                    flex-col
                    gap-3
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    px-4
                    py-3

                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    dark:border-blue-900/50
                    dark:bg-blue-950/30
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <div className="shrink-0 text-2xl">
                      📄
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-slate-800
                          dark:text-slate-200

                          sm:text-base
                        "
                      >
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setError("");
                      setMessage("");

                      const fileInput =
                        document.getElementById(
                          "document"
                        );

                      if (fileInput) {
                        fileInput.value = "";
                      }
                    }}
                    className="
                      self-end
                      rounded-lg
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-100

                      sm:self-auto

                      dark:text-red-400
                      dark:hover:bg-red-950/40
                    "
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                  dark:border-red-900/50
                  dark:bg-red-950/30
                  dark:text-red-400
                "
              >
                {error}
              </div>
            )}

            {/* MESSAGE */}

            {message && (
              <div
                className="
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700
                  dark:border-green-900/50
                  dark:bg-green-950/30
                  dark:text-green-400
                "
              >
                {message}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={
                sending ||
                loading ||
                !selectedFile ||
                !printerId
              }
              className="
                w-full
                rounded-xl
                bg-blue-600
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                transition

                hover:bg-blue-700

                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                focus:ring-offset-white

                disabled:cursor-not-allowed
                disabled:opacity-60

                sm:text-base

                dark:focus:ring-offset-slate-900
              "
            >
              {sending
                ? "Processing..."
                : "Send to Printer"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}