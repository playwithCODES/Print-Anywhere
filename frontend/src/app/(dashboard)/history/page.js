"use client";

import { useEffect, useState } from "react";

import printJobService from "@/services/printjob.service.js";

export default function HistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        if (
          typeof printJobService.getMyPrintJobs !==
          "function"
        ) {
          setJobs([]);
          return;
        }

        const response =
          await printJobService.getMyPrintJobs();

        setJobs(
          response?.printJobs ||
            response?.jobs ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load print history:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load print history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case "completed":
      case "printed":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";

      case "pending":
      case "queued":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";

      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
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

        {/* HEADING */}

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
            Print History
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
            View your recent print jobs.
          </p>
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

              sm:px-5
              sm:py-4

              dark:border-red-900
              dark:bg-red-950/40
              dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* CONTENT CARD */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-colors

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* LOADING */}

          {loading ? (
            <div className="px-4 py-16 text-center sm:px-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading print history...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            /* EMPTY STATE */

            <div className="px-4 py-14 text-center sm:px-6 sm:py-16">
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-2xl
                  dark:bg-slate-800
                "
              >
                🖨️
              </div>

              <h2
                className="
                  mt-4
                  text-lg
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                No print jobs found
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Your print jobs will appear here
                after you send a document.
              </p>

              <a
                href="/print"
                className="
                  mt-6
                  inline-flex
                  w-full
                  justify-center
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700

                  sm:w-auto
                "
              >
                Print a Document
              </a>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead
                    className="
                      border-b
                      border-slate-200
                      bg-slate-50
                      dark:border-slate-800
                      dark:bg-slate-950
                    "
                  >
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Document
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Printer
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Status
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {jobs.map((job) => (
                      <tr
                        key={job._id}
                        className="
                          transition-colors
                          hover:bg-slate-50
                          dark:hover:bg-slate-800/50
                        "
                      >
                        <td className="px-6 py-4">
                          <p className="max-w-xs truncate font-medium text-slate-900 dark:text-white">
                            {job.documentName ||
                              job.fileName ||
                              job.documentUrl ||
                              "Document"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {job.printer?.name ||
                            job.printerName ||
                            "Unknown printer"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              capitalize
                              ${getStatusClasses(
                                job.status
                              )}
                            `}
                          >
                            {job.status ||
                              "unknown"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(
                            job.createdAt
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div
                className="
                  space-y-3
                  p-3

                  sm:space-y-4
                  sm:p-4

                  md:hidden
                "
              >
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      transition-colors

                      dark:border-slate-800
                      dark:bg-slate-950
                    "
                  >
                    {/* DOCUMENT */}

                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-lg
                          dark:bg-slate-800
                        "
                      >
                        📄
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {job.documentName ||
                            job.fileName ||
                            job.documentUrl ||
                            "Document"}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          {job.printer?.name ||
                            job.printerName ||
                            "Unknown printer"}
                        </p>
                      </div>
                    </div>

                    {/* STATUS + DATE */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-t
                        border-slate-100
                        pt-3

                        dark:border-slate-800
                      "
                    >
                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          capitalize
                          ${getStatusClasses(
                            job.status
                          )}
                        `}
                      >
                        {job.status ||
                          "unknown"}
                      </span>

                      <span
                        className="
                          truncate
                          text-right
                          text-xs
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {formatDate(
                          job.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}