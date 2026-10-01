import {
  contextBridge,
  ipcRenderer,
} from "electron";

contextBridge.exposeInMainWorld(
  "printerAgent",
  {
    login: (
      email,
      password
    ) => {
      return ipcRenderer.invoke(
        "agent:login",
        {
          email,
          password,
        }
      );
    },

    register: (
      name,
      email,
      password
    ) => {
      return ipcRenderer.invoke(
        "agent:register",
        {
          name,
          email,
          password,
        }
      );
    },

    getStatus: () => {
      return ipcRenderer.invoke(
        "agent:get-status"
      );
    },

    logout: () => {
      return ipcRenderer.invoke(
        "agent:logout"
      );
    },

    getLocalPrinters: () => {
      return ipcRenderer.invoke(
        "printer:get-local-printers"
      );
    },

    registerPrinter: (
      printer
    ) => {
      return ipcRenderer.invoke(
        "printer:register",
        printer
      );
    },
  }
);