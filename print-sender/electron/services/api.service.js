import fs from "fs";
import axios from "axios";
import config from "../config.js";

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
});

const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data?.data || response.data;
};

const getMyPrinters = async (token) => {
  const response = await api.get("/printers/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const printers =
    response.data?.data?.printers || response.data?.printers || [];
  return Array.isArray(printers) ? printers : [];
};

const uploadPdf = async (pdfPath, fileName, token) => {
  const fileBuffer = await fs.promises.readFile(pdfPath);
  const blob = new Blob([fileBuffer], { type: "application/pdf" });

  const formData = new FormData();
  formData.append("document", blob, fileName);

  const response = await fetch(`${config.apiBaseUrl}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Upload failed (${response.status})`);
  }

  return data?.data || data;
};

const createPrintJob = async (
  { printerId, fileName, fileUrl, copies = 1 },
  token
) => {
  const response = await api.post(
    "/print-jobs",
    { printerId, fileName, fileUrl, copies },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  login,
  getMyPrinters,
  uploadPdf,
  createPrintJob,
};