import authService from "./auth.service.js";
import printerRegistrationService from "./printer-registration.service.js";
import printerService from "./printer.service.js";
import sessionService from "./session.service.js";

import heartbeatWorker from "../workers/heartbeat.worker.js";
import printWorker from "../workers/print.worker.js";

let agentState = {
  running: false,
  token: null,
  user: null,
  printers: [],
  stopHeartbeat: null,
  stopPrintWorkers: [],
};

const getPrintersFromResponse = (response) => {
  const printers =
    response?.data?.printers ||
    response?.printers ||
    [];

  return Array.isArray(printers)
    ? printers
    : [];
};

const updatePrinterState = (updatedPrinter) => {
  if (!updatedPrinter?.printerId) {
    return;
  }

  agentState.printers =
    agentState.printers.map((printer) =>
      printer?.printerId === updatedPrinter.printerId
        ? {
            ...printer,
            ...updatedPrinter,
          }
        : printer
    );
};

const stopWorkers = () => {
  if (agentState.stopHeartbeat) {
    agentState.stopHeartbeat();
  }

  for (const stopWorker of agentState.stopPrintWorkers) {
    if (stopWorker) {
      stopWorker();
    }
  }

  agentState.stopHeartbeat = null;
  agentState.stopPrintWorkers = [];
};

const startWorkers = async () => {
  stopWorkers();

  const printers = agentState.printers;

  const printerIds = printers
    .map((printer) => printer?.printerId)
    .filter(Boolean);

  if (printerIds.length === 0) {
    return;
  }

  agentState.stopHeartbeat =
    heartbeatWorker.startHeartbeatWorker(
      agentState.token,
      printerIds,
      (updatedPrinter) => {
        updatePrinterState(updatedPrinter);
      }
    );

  for (const printer of printers) {
    if (!printer?.printerId) {
      continue;
    }

    const stopPrintWorker =
      await printWorker.startPrintWorker({
        token: agentState.token,
        printerId: printer.printerId,
        printerName: printer.name,
      });

    agentState.stopPrintWorkers.push(
      stopPrintWorker
    );
  }
};

const loadRegisteredPrinters = async () => {
  const response =
    await printerService.getMyPrinters(
      agentState.token
    );

  agentState.printers =
    getPrintersFromResponse(response);

  await startWorkers();
};

const startAgentWithToken = async (
  token,
  user
) => {
  if (!token || !user) {
    throw new Error(
      "Valid agent session is required"
    );
  }

  agentState.token = token;
  agentState.user = user;

  await loadRegisteredPrinters();

  agentState.running = true;

  console.log(
    "Printer Anywhere agent started"
  );

  return agentState;
};

const startAgent = async (
  email,
  password
) => {
  if (agentState.running) {
    return agentState;
  }

  const auth =
    await authService.login(
      email,
      password
    );

  await startAgentWithToken(
    auth.token,
    auth.user
  );

  sessionService.saveSession({
    token: auth.token,
    user: auth.user,
  });

  return agentState;
};

const registerAccount = async (
  name,
  email,
  password
) => {
  if (agentState.running) {
    throw new Error(
      "Agent is already connected"
    );
  }

  const auth =
    await authService.register(
      name,
      email,
      password
    );

  await startAgentWithToken(
    auth.token,
    auth.user
  );

  sessionService.saveSession({
    token: auth.token,
    user: auth.user,
  });

  return agentState;
};

const registerLocalPrinter = async (
  printer
) => {
  if (!agentState.running) {
    throw new Error(
      "Printer Agent is not connected"
    );
  }

  const registeredPrinter =
    await printerRegistrationService.registerLocalPrinter(
      printer,
      agentState.token
    );

  const alreadyExists =
    agentState.printers.some(
      (item) =>
        item.printerId ===
        registeredPrinter.printerId
    );

  if (!alreadyExists) {
    agentState.printers = [
      ...agentState.printers,
      registeredPrinter,
    ];
  } else {
    agentState.printers =
      agentState.printers.map(
        (item) =>
          item.printerId ===
          registeredPrinter.printerId
            ? registeredPrinter
            : item
      );
  }

  await startWorkers();

  return registeredPrinter;
};

const getLocalPrinters = async () => {
  if (!agentState.running) {
    throw new Error(
      "Printer Agent is not connected"
    );
  }

  return printerRegistrationService.getLocalPrinters();
};

const restoreAgent = async () => {
  if (agentState.running) {
    return agentState;
  }

  const session =
    sessionService.getSession();

  if (
    !session?.token ||
    !session?.user
  ) {
    return null;
  }

  try {
    await startAgentWithToken(
      session.token,
      session.user
    );

    return agentState;
  } catch (error) {
    console.error(
      "Failed to restore agent session:",
      error.message
    );

    sessionService.clearSession();

    return null;
  }
};

const stopAgent = () => {
  stopWorkers();

  agentState = {
    running: false,
    token: null,
    user: null,
    printers: [],
    stopHeartbeat: null,
    stopPrintWorkers: [],
  };

  sessionService.clearSession();

  console.log(
    "Printer Anywhere agent stopped"
  );
};

const getAgentState = () => ({
  running: agentState.running,
  user: agentState.user,
  printers: Array.isArray(
    agentState.printers
  )
    ? agentState.printers
    : [],
});

export default {
  startAgent,
  registerAccount,
  registerLocalPrinter,
  getLocalPrinters,
  restoreAgent,
  stopAgent,
  getAgentState,
};