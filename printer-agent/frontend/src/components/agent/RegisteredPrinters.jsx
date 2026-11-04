
"use client";

import { useState } from "react";

export default function RegisteredPrinters({
  printers = [],
  onOpenSettings,
  onPrinterRemoved,
}) {
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  const safePrinters = Array.isArray(printers)
    ? printers
    : [];

  const handleRemove = async (printer) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${printer.name}" from PrintAnywhere?`
    );

    if (!confirmed) return;

    setRemovingId(printer.printerId);
    setError("");

    try {
      const response =
        await window.printerAgent.removePrinter(
          printer.printerId
        );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to remove printer"
        );
      }

      onPrinterRemoved(response.printers);

    } catch (error) {
      console.error("Printer removal failed:", error);

      setError(
        error.message || "Failed to remove printer"
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Registered Printers
        </h2>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          {safePrinters.length}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {safePrinters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-500">
            No printers registered yet.
          </p>

          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Open Printer Settings
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {safePrinters.map((printer) => {
            const isRemoving =
              removingId === printer.printerId;

            return (
              <div
                key={printer.printerId}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {printer.name}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    {printer.printerId}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      printer.status === "online"
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {printer.status || "registered"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(printer)}
                  disabled={Boolean(removingId)}
                  className="w-fit rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
