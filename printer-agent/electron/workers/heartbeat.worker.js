import printerService from "../services/printer.service.js";

const HEARTBEAT_INTERVAL = 60 * 1000;

const startHeartbeatWorker = (
  token,
  printerIds,
  onHeartbeat
) => {
  if (!token) {
    throw new Error(
      "Heartbeat worker requires an authentication token"
    );
  }

  if (
    !Array.isArray(printerIds) ||
    printerIds.length === 0
  ) {
    throw new Error(
      "Heartbeat worker requires at least one printer"
    );
  }

  let stopped = false;

  const sendHeartbeats = async () => {
    if (stopped) {
      return;
    }

    for (const printerId of printerIds) {
      try {
        const response =
          await printerService.sendHeartbeat(
            printerId,
            token
          );

        console.log(
          `Heartbeat sent: ${printerId}`
        );

        if (typeof onHeartbeat === "function") {
          const printer =
            response?.printer;

          if (printer) {
            onHeartbeat(printer);
          }
        }
      } catch (error) {
        console.error(
          `Heartbeat failed for ${printerId}:`,
          error.response?.data ||
            error.message
        );
      }
    }
  };

  sendHeartbeats();

  const interval = setInterval(
    sendHeartbeats,
    HEARTBEAT_INTERVAL
  );

  return () => {
    stopped = true;
    clearInterval(interval);

    console.log(
      "Heartbeat worker stopped"
    );
  };
};

export default {
  startHeartbeatWorker,
};