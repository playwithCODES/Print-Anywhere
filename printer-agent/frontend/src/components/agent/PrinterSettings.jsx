"use client";

import {
  useState,
} from "react";

export default function PrinterSettings({
  printers = [],
  onPrinterRegistered,
  onClose,
}) {
  const [localPrinters, setLocalPrinters] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [registering, setRegistering] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadLocalPrinters = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (
        !window.printerAgent
      ) {
        throw new Error(
          "Printer Agent is not available"
        );
      }

      const response =
        await window.printerAgent.getLocalPrinters();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to detect printers"
        );
      }

      setLocalPrinters(
        Array.isArray(
          response.printers
        )
          ? response.printers
          : []
      );
    } catch (error) {
      console.error(
        "Failed to detect printers:",
        error
      );

      setError(
        error.message ||
          "Failed to detect printers"
      );
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (
    localPrinter
  ) => {
    const name =
      localPrinter?.name;

    return printers.some(
      (printer) =>
        printer?.name === name
    );
  };

  const handleRegister = async (
    printer
  ) => {
    setRegistering(
      printer.name
    );

    setError("");
    setMessage("");

    try {
      const response =
        await window.printerAgent.registerPrinter(
          printer
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Printer registration failed"
        );
      }

      onPrinterRegistered(
        response.printer
      );

      setMessage(
        `${printer.name} registered successfully.`
      );
    } catch (error) {
      console.error(
        "Printer registration failed:",
        error
      );

      setError(
        error.message ||
          "Printer registration failed"
      );
    } finally {
      setRegistering("");
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Printer Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detect and register printers connected to this computer.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <button
        type="button"
        onClick={
          loadLocalPrinters
        }
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Detecting Printers..."
          : "Detect Local Printers"}
      </button>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
          {message}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {localPrinters.map(
          (printer) => {
            const registered =
              isRegistered(
                printer
              );

            return (
              <div
                key={printer.name}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {printer.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {printer.driverName ||
                      "Local printer"}
                  </p>
                </div>

                {registered ? (
                  <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                    Registered
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleRegister(
                        printer
                      )
                    }
                    disabled={
                      registering ===
                      printer.name
                    }
                    className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {registering ===
                    printer.name
                      ? "Registering..."
                      : "Register"}
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}