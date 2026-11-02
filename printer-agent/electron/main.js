
import config from "./config/config.js";

import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} from "electron";

import path from "path";
import {
  fileURLToPath,
} from "url";

import agentService from "./services/agent.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;
let isQuitting = false;

/*
|--------------------------------------------------------------------------
| Create Tray Icon
|--------------------------------------------------------------------------
*/

const createTrayIcon = () => {
  const iconPath = path.join(
    app.getAppPath(),
    "assets",
    "tray.png"
  );

  const icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    console.error("Tray icon failed to load:", iconPath);
    return nativeImage.createEmpty();
  }

  // Windows system tray icon size
  return icon.resize({
    width: 16,
    height: 16,
  });
};

/*
|--------------------------------------------------------------------------
| Show Dashboard
|--------------------------------------------------------------------------
*/

const showDashboard = () => {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
};

/*
|--------------------------------------------------------------------------
| Create System Tray
|--------------------------------------------------------------------------
*/

const createTray = () => {
  if (tray) return;

  tray = new Tray(createTrayIcon());

  tray.setToolTip("Print Anywhere Agent");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Dashboard",
      click: () => {
        showDashboard();
      },
    },

   {
  label: "Logout",
  click: async () => {
    try {
      agentService.stopAgent();

      // Show the login page after explicitly logging out.
      showDashboard();

      if (mainWindow) {
        mainWindow.reload();
      }
    } catch (error) {
      console.error(
        "Tray logout failed:",
        error.message
      );
    }
  },
},

    {
      type: "separator",
    },

    {
      label: "Quit Agent",
      click: () => {
        isQuitting = true;

        agentService.stopAgent();

        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    showDashboard();
  });
};

/*
|--------------------------------------------------------------------------
| Create Electron Window
|--------------------------------------------------------------------------
*/

const createWindow = () => {
  mainWindow = new BrowserWindow({
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

  if (app.isPackaged) {
    const frontendPath = path.join(
      process.resourcesPath,
      "frontend",
      "out",
      "index.html"
    );

    console.log(
      "Packaged frontend path:",
      frontendPath
    );

    mainWindow.loadFile(frontendPath);
  } else {
    console.log(
      "Electron development frontend URL:",
      config.frontendUrl
    );

    mainWindow.loadURL(config.frontendUrl);

    mainWindow.webContents.on(
      "did-finish-load",
      () => {
        console.log(
          "Electron frontend loaded:",
          mainWindow.webContents.getURL()
        );
      }
    );

    mainWindow.webContents.on(
      "did-fail-load",
      (
        event,
        errorCode,
        errorDescription,
        validatedURL
      ) => {
        console.error(
          "Electron frontend failed:",
          {
            errorCode,
            errorDescription,
            validatedURL,
          }
        );
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Close Window -> Hide To Tray
  |--------------------------------------------------------------------------
  */

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();

      mainWindow.hide();

      console.log(
        "Print Anywhere hidden to system tray"
      );
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

/*
|--------------------------------------------------------------------------
| Agent Login
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "agent:login",
  async (event, credentials) => {
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

      console.log(
        "LOGIN REQUEST:",
        email
      );

      const agent =
        await agentService.startAgent(
          email,
          password
        );

      console.log(
        "LOGIN RESPONSE:",
        agent
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

/*
|--------------------------------------------------------------------------
| Agent Registration
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "agent:register",
  async (event, data) => {
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

/*
|--------------------------------------------------------------------------
| Agent Status
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "agent:get-status",
  async () => {
    return agentService.getAgentState();
  }
);

/*
|--------------------------------------------------------------------------
| Agent Logout
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Get Local Printers
|--------------------------------------------------------------------------
*/

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

        message:
          error.message,

        printers: [],
      };
    }
  }
);

/*
|--------------------------------------------------------------------------
| Register Printer
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "printer:register",
  async (event, printer) => {
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

/*
|--------------------------------------------------------------------------
| Electron Ready
|--------------------------------------------------------------------------
*/

app.whenReady().then(async () => {
  // Automatically launch the agent when Windows starts.
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
    });
  }

  // Create tray first so the agent is accessible in the background.
  createTray();

  // Restore the saved login session and start agent workers.
  // Do not create or show the dashboard during startup.
  try {
    const restoredAgent = await agentService.restoreAgent();

    if (restoredAgent?.running) {
      console.log(
        "Agent session restored successfully in background"
      );
    } else {
      console.log(
        "No active saved session. Agent is waiting in the system tray."
      );
    }
  } catch (error) {
    console.error(
      "Agent startup restore failed:",
      error.message
    );
  }

  // Open the dashboard only when requested by the user.
  app.on("activate", () => {
    showDashboard();
  });
});

/*
|--------------------------------------------------------------------------
| Prevent Accidental Application Quit
|--------------------------------------------------------------------------
*/

app.on("before-quit", () => {
  isQuitting = true;
});

/*
|--------------------------------------------------------------------------
| Close Application
|--------------------------------------------------------------------------
*/

app.on("window-all-closed", () => {
  // Do not quit. The application stays in the system tray.
});
