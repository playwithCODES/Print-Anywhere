import agentService from "./services/agent.service.js";
import printWorkerService from "./services/print-worker.service.js";

const start = async () => {
  try {
    await agentService.loginAgent();

    console.log("Agent authenticated successfully.");

    printWorkerService.startWorker();
  } catch (error) {
    console.log("Failed to start printer agent:", error.message);
  }
};

start();