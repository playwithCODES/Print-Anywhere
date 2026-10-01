"use client";

import { useEffect, useState } from "react";

import printerService from "@/services/printer.service.js";
import printJobService from "@/services/printjob.service.js";

const getInitialUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to read user:", error);
    return null;
  }
};

const StatCard = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-colors

        sm:p-6

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="
              text-xs
              font-medium
              text-slate-500
              dark:text-slate-400

              sm:text-sm
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-900
              dark:text-white

              sm:mt-3
              sm:text-3xl
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
              dark:text-slate-400

              sm:mt-2
              sm:text-sm
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-lg

            sm:h-12
            sm:w-12
            sm:text-xl

            dark:bg-blue-950
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [user] = useState(getInitialUser);

  const [printers, setPrinters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // ==========================================
        // LOAD PRINTERS
        // ==========================================

        try {
          const printersResponse =
            await printerService.getMyPrinters();

          setPrinters(
            printersResponse?.printers || []
          );
        } catch (error) {
          console.error(
            "Failed to load printers:",
            error
          );

          setPrinters([]);
        }

        // ==========================================
        // LOAD PRINT JOBS
        // ==========================================

        try {
          if (
            typeof printJobService.getMyPrintJobs ===
            "function"
          ) {
            const jobsResponse =
              await printJobService.getMyPrintJobs();

            setJobs(
              jobsResponse?.printJobs ||
                jobsResponse?.jobs ||
                []
            );
          }
        } catch (error) {
          console.error(
            "Failed to load print jobs:",
            error
          );

          setJobs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const onlinePrinters = printers.filter(
    (printer) => printer.status === "online"
  ).length;

  const pendingJobs = jobs.filter(
    (job) =>
      job.status === "pending" ||
      job.status === "queued" ||
      job.status === "processing"
  ).length;

  const completedJobs = jobs.filter(
    (job) =>
      job.status === "completed" ||
      job.status === "printed"
  ).length;

  const userName = user?.name || "User";

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

        {/* PAGE HEADING */}

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
            Dashboard
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
            Manage your remote printing activity
          </p>
        </div>

        {/* WELCOME CARD */}

        <section
          className="
            mb-6
            rounded-2xl
            border
            border-blue-200
            bg-white
            p-5
            shadow-sm
            transition-colors

            sm:mb-8
            sm:p-8

            dark:border-blue-900
            dark:bg-slate-900
          "
        >
          <div className="max-w-3xl">
            <h2
              className="
                text-xl
                font-bold
                leading-tight
                text-slate-900
                dark:text-white

                sm:text-2xl
              "
            >
              Welcome back, {userName} 👋
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400

                sm:text-base
              "
            >
              Send documents to your registered
              printers from anywhere.
            </p>

            <a
              href="/print"
              className="
                mt-5
                inline-flex
                w-full
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                active:scale-[0.98]

                sm:mt-6
                sm:w-auto
                sm:text-base
              "
            >
              Print a Document
            </a>
          </div>
        </section>

        {/* STATS */}

        <section
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2
            sm:gap-5

            xl:grid-cols-4
          "
        >
          <StatCard
            title="Total Prints"
            value={loading ? "..." : jobs.length}
            description="All print jobs"
            icon="🖨️"
          />

          <StatCard
            title="Pending Jobs"
            value={loading ? "..." : pendingJobs}
            description="Waiting to print"
            icon="◷"
          />

          <StatCard
            title="Completed Jobs"
            value={loading ? "..." : completedJobs}
            description="Successfully printed"
            icon="✓"
          />

          <StatCard
            title="Available Printers"
            value={
              loading ? "..." : onlinePrinters
            }
            description="Currently online"
            icon="🖨️"
          />
        </section>

        {/* PRINTER OVERVIEW */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-colors

            sm:mt-8
            sm:p-6

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white

                  sm:text-xl
                "
              >
                Printer Overview
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-slate-400

                  sm:text-sm
                "
              >
                Your registered printers and their
                current status.
              </p>
            </div>

            <a
              href="/printers"
              className="
                self-start
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-700

                dark:text-blue-400
                dark:hover:text-blue-300
              "
            >
              View all printers →
            </a>
          </div>

          <div className="mt-5 sm:mt-6">
            {loading ? (
              <p
                className="
                  py-8
                  text-center
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Loading printers...
              </p>
            ) : printers.length === 0 ? (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-slate-300
                  px-5
                  py-10
                  text-center

                  dark:border-slate-700
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-xl
                    dark:bg-slate-800
                  "
                >
                  🖨️
                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-slate-700
                    dark:text-slate-300
                  "
                >
                  No printers detected.
                </p>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Make sure the Print Anywhere
                  Agent is running on a computer
                  connected to your printer.
                </p>

                <a
                  href="/printers"
                  className="
                    mt-4
                    inline-block
                    text-sm
                    font-semibold
                    text-blue-600
                    hover:text-blue-700

                    dark:text-blue-400
                  "
                >
                  View My Printers →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {printers
                  .slice(0, 5)
                  .map((printer) => (
                    <div
                      key={
                        printer._id ||
                        printer.printerId
                      }
                      className="
                        flex
                        flex-col
                        gap-3
                        rounded-xl
                        border
                        border-slate-200
                        p-4
                        transition-colors

                        sm:flex-row
                        sm:items-center
                        sm:justify-between

                        dark:border-slate-800
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            font-semibold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {printer.name}
                        </p>

                        <p
                          className="
                            mt-1
                            break-all
                            text-xs
                            text-slate-500
                            dark:text-slate-400

                            sm:text-sm
                          "
                        >
                          {printer.printerId}
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className={`
                            h-2.5
                            w-2.5
                            rounded-full

                            ${
                              printer.status ===
                              "online"
                                ? "bg-green-500"
                                : "bg-slate-400"
                            }
                          `}
                        />

                        <span
                          className="
                            text-sm
                            font-medium
                            capitalize
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          {printer.status ||
                            "offline"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}