"use client";

import { useEffect, useState } from "react";

import printerService from "@/services/printer.service.js";

export default function PrintersPage() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrinters = async () => {
      try {
        setLoading(true);
        setError("");

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

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) {
      return "Never";
    }

    return new Date(lastSeen).toLocaleString();
  };

  return (
    <main
      className="
        min-h-[calc(100vh-5rem)]
        bg-slate-100
        px-4
        py-6
        text-slate-900
        transition-colors

        sm:px-6
        sm:py-8

        lg:px-8
        lg:py-10

        dark:bg-slate-950
        dark:text-white
      "
    >
      <div className="mx-auto w-full max-w-7xl">

        {/* PAGE HEADER */}

        <div className="mb-6 sm:mb-8">
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white

              sm:text-3xl
            "
          >
            My Printers
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
              dark:text-slate-400

              sm:text-base
            "
          >
            View printers connected to your
            Print Anywhere Agent.
          </p>
        </div>

        {/* INFO */}

        <div
          className="
            mb-6
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            px-4
            py-3
            text-sm
            text-blue-700

            dark:border-blue-900/50
            dark:bg-blue-950/30
            dark:text-blue-400
          "
        >
          Printers are automatically registered by
          the Print Anywhere Agent running on the
          printer computer.
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700

              dark:border-red-900
              dark:bg-red-950/40
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-10
              text-center
              shadow-sm

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto
                h-8
                w-8
                animate-spin
                rounded-full
                border-4
                border-slate-200
                border-t-blue-600

                dark:border-slate-700
                dark:border-t-blue-500
              "
            />

            <p
              className="
                mt-4
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Loading printers...
            </p>
          </div>
        ) : printers.length === 0 ? (
          /* EMPTY STATE */

          <div
            className="
              rounded-2xl
              border-2
              border-dashed
              border-slate-300
              bg-white
              px-5
              py-12
              text-center

              sm:p-12

              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-slate-100
                text-3xl
                dark:bg-slate-800
              "
            >
              🖨️
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              No printers detected
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Install and sign in to the Print
              Anywhere Agent on a computer connected
              to a printer. The Agent will automatically
              register the printer here.
            </p>
          </div>
        ) : (
          /* PRINTER CARDS */

          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:gap-5

              lg:grid-cols-2
              lg:gap-6
            "
          >
            {printers.map((printer) => (
              <div
                key={printer._id}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition

                  sm:p-6

                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                {/* PRINTER HEADER */}

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-xl

                      dark:bg-blue-950/50
                    "
                  >
                    🖨️
                  </div>

                  {/* NAME + ID */}

                  <div className="min-w-0 flex-1">
                    <h3
                      className="
                        break-words
                        text-base
                        font-bold
                        text-slate-900
                        dark:text-white

                        sm:text-lg
                      "
                    >
                      {printer.name}
                    </h3>

                    <p
                      className="
                        mt-1
                        break-all
                        text-[11px]
                        leading-5
                        text-slate-500
                        dark:text-slate-400

                        sm:text-xs
                      "
                    >
                      ID: {printer.printerId}
                    </p>
                  </div>

                  {/* STATUS */}

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      capitalize

                      sm:px-3
                      sm:text-xs

                      ${
                        printer.status === "online"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }
                    `}
                  >
                    {printer.status || "offline"}
                  </span>
                </div>

                {/* STATUS INDICATOR */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-50
                    px-3
                    py-3

                    dark:bg-slate-950
                  "
                >
                  <span
                    className={`
                      h-2.5
                      w-2.5
                      rounded-full

                      ${
                        printer.status === "online"
                          ? "bg-green-500"
                          : "bg-slate-400"
                      }
                    `}
                  />

                  <span
                    className="
                      text-xs
                      font-medium
                      text-slate-600
                      dark:text-slate-300

                      sm:text-sm
                    "
                  >
                    {printer.status === "online"
                      ? "Printer is ready"
                      : "Printer is offline"}
                  </span>
                </div>

                {/* LAST SEEN */}

                <div
                  className="
                    mt-4
                    border-t
                    border-slate-100
                    pt-4

                    dark:border-slate-800
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-1

                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <span
                      className="
                        text-xs
                        font-medium
                        text-slate-500
                        dark:text-slate-400

                        sm:text-sm
                      "
                    >
                      Last seen
                    </span>

                    <span
                      className="
                        text-xs
                        text-slate-600
                        dark:text-slate-300

                        sm:text-sm
                      "
                    >
                      {formatLastSeen(
                        printer.lastSeen
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}