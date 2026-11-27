import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} from "electron";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import apiService from "./services/api.service.js";
import sessionService from "./services/session.service.js";
import spoolService from "./services/spool.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;
let isQuitting = false;
let stopWatcher = null;

let state = {
  loggedIn: false,
  token: null,
  user: null,
  printers: [],
  selectedPrinterId: null,
  logs: [],
};

const isPort6310Active = () =>
  new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:6310/", (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });

const ensureVirtualPrinterRunning = async () => {
  const alreadyRunning = await isPort6310Active();
  if (alreadyRunning) return;

  const packagedExe = path.join(
    process.resourcesPath,
    "virtual-printer-bin",
    "PrintAnywhere.VirtualPrinter.exe"
  );
  const devExe = path.join(
    app.getAppPath(),
    "virtual-printer-bin",
    "PrintAnywhere.VirtualPrinter.exe"
  );

  const exePath = fs.existsSync(packagedExe)
    ? packagedExe
    : fs.existsSync(devExe)
      ? devExe
      : null;

  if (!exePath) return;

  const child = spawn(exePath, [], {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  child.unref();
};

const addLog = (entry) => {
  const item = {
    time: new Date().toLocaleTimeString(),
    ...entry,
  };
  state.logs = [item, ...state.logs].slice(0, 20);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("sender:log", item);
  }
};

const getTargetPrinter = () => {
  const physical = state.printers.filter(
    (p) => p?.printerId && !/print\s*anywhere/i.test(p?.name || "")
  );
  if (physical.length === 0) return null;

  return (
    physical.find((p) => p.printerId === state.selectedPrinterId) ||
    physical.find((p) => p.status === "online") ||
    physical[0]
  );
};

const syncTrayTooltip = () => {
  if (!tray) return;
  if (!state.loggedIn) {
    tray.setToolTip("Print Anywhere Sender (Not Logged In)");
    return;
  }
  const target = getTargetPrinter();
  tray.setToolTip(
    `Print Anywhere: ${state.user?.email} -> ${target ? target.name : "No Printer"}`
  );
};

const createTrayIcon = () => {
  const iconPath = path.join(app.getAppPath(), "assets", "tray.png");
  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    return nativeImage.createEmpty();
  }
  return icon.resize({ width: 16, height: 16 });
};

const showWindow = () => {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
};

const refreshPrintersForSession = async () => {
  if (!state.token) return;
  const printers = await apiService.getMyPrinters(state.token);
  state.printers = printers;

  const target = getTargetPrinter();
  state.selectedPrinterId = target?.printerId || null;

  sessionService.saveSession({
    token: state.token,
    user: state.user,
    selectedPrinterId: state.selectedPrinterId,
  });

  syncTrayTooltip();
};

const logoutUser = () => {
  state.loggedIn = false;
  state.token = null;
  state.user = null;
  state.printers = [];
  state.selectedPrinterId = null;
  sessionService.clearSession();
  syncTrayTooltip();
  addLog({ type: "info", message: "Logged out. Ready for another account." });
};

const createTray = () => {
  if (tray) return;
  tray = new Tray(createTrayIcon());
  syncTrayTooltip();

  const menu = Menu.buildFromTemplate([
    {
      label: "Open Print Anywhere Sender",
      click: () => showWindow(),
    },
    {
      label: "Switch Account (Logout)",
      click: () => {
        logoutUser();
        showWindow();
        if (mainWindow) mainWindow.reload();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        if (stopWatcher) stopWatcher();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
  tray.on("click", () => showWindow());
  tray.on("double-click", () => showWindow());
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 580,
    resizable: false,
    title: "Print Anywhere Sender",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

ipcMain.handle("sender:get-state", () => ({
  loggedIn: state.loggedIn,
  user: state.user,
  printers: state.printers,
  selectedPrinterId: state.selectedPrinterId,
  logs: state.logs,
}));

ipcMain.handle("sender:login", async (_, { email, password }) => {
  try {
    const auth = await apiService.login(email, password);
    if (!auth?.token || !auth?.user) {
      throw new Error("Invalid login response from server");
    }

    state.loggedIn = true;
    state.token = auth.token;
    state.user = auth.user;
    state.selectedPrinterId = null;

    await refreshPrintersForSession();
    addLog({
      type: "info",
      message: `Logged in as ${auth.user.email}`,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Login failed",
    };
  }
});

ipcMain.handle("sender:logout", () => {
  logoutUser();
  return { success: true };
});

ipcMain.handle("sender:select-printer", (_, printerId) => {
  state.selectedPrinterId = printerId;
  sessionService.saveSession({
    token: state.token,
    user: state.user,
    selectedPrinterId: state.selectedPrinterId,
  });
  syncTrayTooltip();
  const target = getTargetPrinter();
  if (target) {
    addLog({
      type: "info",
      message: `Target printer switched to "${target.name}"`,
    });
  }
  return { success: true };
});

ipcMain.handle("sender:refresh-printers", async () => {
  try {
    await refreshPrintersForSession();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
});

app.whenReady().then(async () => {
  if (app.isPackaged) {
    app.setLoginItemSettings({ openAtLogin: true });
  }

  await ensureVirtualPrinterRunning();
  createTray();

  stopWatcher = spoolService.startSpoolWatcher(
    () => ({
      token: state.token,
      user: state.user,
      targetPrinter: getTargetPrinter(),
    }),
    (event) => addLog(event)
  );

  const saved = sessionService.getSession();
  if (saved?.token && saved?.user) {
    try {
      state.loggedIn = true;
      state.token = saved.token;
      state.user = saved.user;
      state.selectedPrinterId = saved.selectedPrinterId || null;
      await refreshPrintersForSession();
      addLog({
        type: "info",
        message: `Auto-restored session for ${saved.user.email}`,
      });
    } catch {
      logoutUser();
      showWindow();
    }
  } else {
    showWindow();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  // Keep running in system tray
});