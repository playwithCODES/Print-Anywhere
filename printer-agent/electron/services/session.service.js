import { app, safeStorage } from "electron";
import fs from "fs";
import path from "path";

const getSessionPath = () => {
  return path.join(
    app.getPath("userData"),
    "agent-session.dat"
  );
};

const saveSession = (session) => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(
      "Secure storage is not available on this computer"
    );
  }

  const encryptedData = safeStorage.encryptString(
    JSON.stringify(session)
  );

  fs.writeFileSync(
    getSessionPath(),
    encryptedData
  );
};

const getSession = () => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return null;
    }

    const sessionPath = getSessionPath();

    if (!fs.existsSync(sessionPath)) {
      return null;
    }

    const encryptedData =
      fs.readFileSync(sessionPath);

    const decryptedData =
      safeStorage.decryptString(encryptedData);

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error(
      "Failed to restore agent session:",
      error.message
    );

    return null;
  }
};

const clearSession = () => {
  try {
    const sessionPath = getSessionPath();

    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
  } catch (error) {
    console.error(
      "Failed to clear agent session:",
      error.message
    );
  }
};

export default {
  saveSession,
  getSession,
  clearSession,
};