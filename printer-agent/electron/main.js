import "dotenv/config";

import {
  app,
  BrowserWindow,
  ipcMain,
} from "electron";

import path from "path";
import {
  fileURLToPath,
} from "url";

import agentService from "./services/agent.service.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

let mainWindow = null;

const createWindow = () => {
  mainWindow =
    new BrowserWindow({
      width: 1000,
      height: 700,

      webPreferences: {
        preload: path.join(
          __dirname,
          "preload.mjs"
        ),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

  mainWindow.loadURL(
    "http://localhost:3001"
  );
};

/* ================================
   LOGIN
================================ */

ipcMain.handle(
  "agent:login",
  async (
    event,
    credentials
  ) => {
    try {
      const {
        email,
        password,
      } = credentials || {};

      if (!email || !password) {
        throw new Error(
          "Email and password are required"
        );
      }

      const agent =
        await agentService.startAgent(
          email,
          password
        );

      return {
        success: true,
        message:
          "Agent login successful",
        data: {
          user: agent.user,
          printers:
            agent.printers || [],
        },
      };
    } catch (error) {
      console.error(
        "Agent login failed:",
        error.response?.data ||
          error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Agent login failed",
      };
    }
  }
);

/* ================================
   REGISTER ACCOUNT
================================ */

ipcMain.handle(
  "agent:register",
  async (
    event,
    data
  ) => {
    try {
      const {
        name,
        email,
        password,
      } = data || {};

      if (
        !name ||
        !email ||
        !password
      ) {
        throw new Error(
          "Name, email and password are required"
        );
      }

      const agent =
        await agentService.registerAccount(
          name,
          email,
          password
        );

      return {
        success: true,
        message:
          "Account created successfully",
        data: {
          user: agent.user,
          printers:
            agent.printers || [],
        },
      };
    } catch (error) {
      console.error(
        "Agent registration failed:",
        error.response?.data ||
          error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  }
);

/* ================================
   STATUS
================================ */

ipcMain.handle(
  "agent:get-status",
  async () => {
    return agentService.getAgentState();
  }
);

/* ================================
   LOGOUT
================================ */

ipcMain.handle(
  "agent:logout",
  async () => {
    agentService.stopAgent();

    return {
      success: true,
      message:
        "Agent logged out successfully",
    };
  }
);

/* ================================
   GET LOCAL PRINTERS
================================ */

ipcMain.handle(
  "printer:get-local-printers",
  async () => {
    try {
      const printers =
        await agentService.getLocalPrinters();

      return {
        success: true,
        printers:
          Array.isArray(printers)
            ? printers
            : [],
      };
    } catch (error) {
      console.error(
        "Failed to get local printers:",
        error.message
      );

      return {
        success: false,
        message: error.message,
        printers: [],
      };
    }
  }
);

/* ================================
   REGISTER PRINTER
================================ */

ipcMain.handle(
  "printer:register",
  async (
    event,
    printer
  ) => {
    try {
      const registeredPrinter =
        await agentService.registerLocalPrinter(
          printer
        );

      return {
        success: true,
        message:
          "Printer registered successfully",
        printer:
          registeredPrinter,
      };
    } catch (error) {
      console.error(
        "Printer registration failed:",
        error.response?.data ||
          error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Printer registration failed",
      };
    }
  }
);

/* ================================
   ELECTRON READY
================================ */

app.whenReady().then(
  async () => {
    createWindow();

    await agentService.restoreAgent();

    app.on(
      "activate",
      () => {
        if (
          BrowserWindow
            .getAllWindows()
            .length === 0
        ) {
          createWindow();
        }
      }
    );
  }
);

/* ================================
   CLOSE
================================ */

app.on(
  "window-all-closed",
  () => {
    if (
      process.platform !==
      "darwin"
    ) {
      app.quit();
    }
  }
);