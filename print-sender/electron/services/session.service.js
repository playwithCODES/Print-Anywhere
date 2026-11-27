import fs from "fs";
import path from "path";
import { app } from "electron";

const getSessionFilePath = () =>
  path.join(app.getPath("userData"), "sender-session.json");

const getSession = () => {
  try {
    const filePath = getSessionFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read saved session:", error.message);
    return null;
  }
};

const saveSession = (sessionData) => {
  try {
    const filePath = getSessionFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save session:", error.message);
  }
};

const clearSession = () => {
  try {
    const filePath = getSessionFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to clear session:", error.message);
  }
};

export default {
  getSession,
  saveSession,
  clearSession,
};