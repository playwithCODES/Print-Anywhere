const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("senderAPI", {
  getState: () => ipcRenderer.invoke("sender:get-state"),
  login: (credentials) => ipcRenderer.invoke("sender:login", credentials),
  logout: () => ipcRenderer.invoke("sender:logout"),
  selectPrinter: (printerId) =>
    ipcRenderer.invoke("sender:select-printer", printerId),
  refreshPrinters: () => ipcRenderer.invoke("sender:refresh-printers"),
  onLog: (callback) => {
    const listener = (_, payload) => callback(payload);
    ipcRenderer.on("sender:log", listener);
    return () => ipcRenderer.removeListener("sender:log", listener);
  },
});