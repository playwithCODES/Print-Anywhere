"use client";

import {
  useEffect,
  useState,
} from "react";

import AgentLogin from "@/components/agent/AgentLogin";
import AgentDashboard from "@/components/agent/AgentDashboard";

export default function HomePage() {
  const [agent, setAgent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAgent = async () => {
      try {
        if (
          !window.printerAgent
        ) {
          return;
        }

        const status =
          await window.printerAgent.getStatus();

        if (cancelled) {
          return;
        }

        if (status?.running) {
          setAgent({
            running: true,
            user:
              status.user || null,
            printers:
              Array.isArray(
                status.printers
              )
                ? status.printers
                : [],
          });
        }
      } catch (error) {
        console.error(
          "Failed to load agent:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAgent();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnected = (
    agentData
  ) => {
    setAgent({
      running: true,
      user:
        agentData?.user || null,
      printers:
        Array.isArray(
          agentData?.printers
        )
          ? agentData.printers
          : [],
    });
  };

  const handleAgentUpdate = (
    update
  ) => {
    setAgent((previous) => {
      if (!previous) {
        return previous;
      }

      if (
        typeof update ===
        "function"
      ) {
        return update(previous);
      }

      return {
        ...previous,
        ...update,
      };
    });
  };

  const handleLogout = () => {
    setAgent(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading Printer Agent...
        </p>
      </main>
    );
  }

  if (!agent) {
    return (
      <AgentLogin
        onConnected={
          handleConnected
        }
      />
    );
  }

  return (
    <AgentDashboard
      agent={agent}
      onAgentUpdate={
        handleAgentUpdate
      }
      onLogout={handleLogout}
    />
  );
}