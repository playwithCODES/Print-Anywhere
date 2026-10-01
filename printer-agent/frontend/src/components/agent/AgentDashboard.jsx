"use client";

import {
  useEffect,
  useState,
} from "react";

import AccountInfo from "./AccountInfo";
import RegisteredPrinters from "./RegisteredPrinters";
import PrinterSettings from "./PrinterSettings";

export default function AgentDashboard({
  agent,
  onAgentUpdate,
  onLogout,
}) {
  const [showSettings, setShowSettings] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const printers =
    Array.isArray(agent?.printers)
      ? agent.printers
      : [];

  useEffect(() => {
    let cancelled = false;

    const refreshAgentStatus = async () => {
      try {
        if (!window.printerAgent) {
          return;
        }

        const status =
          await window.printerAgent.getStatus();

        if (
          cancelled ||
          !status?.running
        ) {
          return;
        }

        onAgentUpdate({
          running: true,
          user: status.user || null,
          printers: Array.isArray(
            status.printers
          )
            ? status.printers
            : [],
        });
      } catch (error) {
        console.error(
          "Failed to refresh agent status:",
          error
        );
      }
    };

    refreshAgentStatus();

    const interval = setInterval(
      refreshAgentStatus,
      5000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onAgentUpdate]);

  const handlePrinterRegistered = (
    printer
  ) => {
    if (!printer) {
      return;
    }

    onAgentUpdate(
      (previous) => ({
        ...previous,
        printers: [
          ...(Array.isArray(
            previous?.printers
          )
            ? previous.printers
            : []),
          printer,
        ],
      })
    );

    setMessage(
      `${printer.name} registered successfully.`
    );

    setShowSettings(false);
  };

  const handleLogout = async () => {
    setError("");

    try {
      const response =
        await window.printerAgent.logout();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Logout failed"
        );
      }

      onLogout();
    } catch (error) {
      console.error(
        "Agent logout failed:",
        error
      );

      setError(
        error.message ||
          "Logout failed"
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Print
                <span className="text-blue-600">
                  Anywhere
                </span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Printer Agent
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setShowSettings(
                    true
                  );
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Printer Settings
              </button>

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              ✓
            </div>

            <div>
              <p className="font-semibold text-green-700">
                Printer Agent Connected
              </p>

              <p className="text-sm text-green-600">
                {agent?.user?.email ||
                  "User connected"}
              </p>
            </div>
          </div>
        </div>

        <AccountInfo
          user={agent?.user}
        />

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

        <RegisteredPrinters
          printers={printers}
          onOpenSettings={() => {
            setError("");
            setMessage("");
            setShowSettings(
              true
            );
          }}
        />

        {showSettings && (
          <PrinterSettings
            printers={printers}
            onPrinterRegistered={
              handlePrinterRegistered
            }
            onClose={() =>
              setShowSettings(false)
            }
          />
        )}
      </div>
    </main>
  );
}