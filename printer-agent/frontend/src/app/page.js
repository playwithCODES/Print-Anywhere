"use client";

import {
  useEffect,
  useState,
} from "react";

import AgentLogin from "@/components/agent/AgentLogin";
import AgentDashboard from "@/components/agent/AgentDashboard";

export default function HomePage() {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const restoreAgent = async () => {
      try {
        if (!window.printerAgent) {
          console.error(
            "Printer Agent bridge is not available"
          );
          return;
        }

        const status =
          await window.printerAgent.getStatus();

        console.log(
          "Agent status:",
          status
        );

        if (status?.running) {
          setAgent({
            running: true,
            user: status.user || null,
            printers:
              Array.isArray(status.printers)
                ? status.printers
                : [],
          });
        }
      } catch (error) {
        console.error(
          "Failed to restore agent:",
          error
        );
      }
    };

    restoreAgent();
  }, []);

  const handleConnected = (
    agentData
  ) => {
    setAgent({
      running: true,
      user: agentData?.user || null,
      printers:
        Array.isArray(agentData?.printers)
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
        typeof update === "function"
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

  if (!agent) {
    return (
      <AgentLogin
        onConnected={handleConnected}
      />
    );
  }

  return (
    <AgentDashboard
      agent={agent}
      onAgentUpdate={handleAgentUpdate}
      onLogout={handleLogout}
    />
  );
}