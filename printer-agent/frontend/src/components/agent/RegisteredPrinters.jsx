"use client";

export default function RegisteredPrinters({
  printers = [],
  onOpenSettings,
}) {
  const safePrinters = Array.isArray(printers)
    ? printers
    : [];

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
          {safePrinters.map((printer) => (
            <div
              key={
                printer._id ||
                printer.printerId ||
                printer.name
              }
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {printer.name}
                </p>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {printer.printerId}
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                {printer.status || "registered"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}