import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";

const downloadFile = async (fileUrl, fileName) => {
  if (!fileUrl) {
    throw new Error("File URL is required");
  }

  if (!fileName) {
    throw new Error("File name is required");
  }

  const tempDirectory = path.join(
    os.tmpdir(),
    "print-anywhere"
  );

  await fs.promises.mkdir(tempDirectory, {
    recursive: true,
  });

  const safeFileName = path.basename(fileName);

  const filePath = path.join(
    tempDirectory,
    `${Date.now()}-${safeFileName}`
  );

  console.log(`Downloading file: ${fileUrl}`);

  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",
  });

  await fs.promises.writeFile(
    filePath,
    response.data
  );

  console.log(`File downloaded: ${filePath}`);

  return filePath;
};

const deleteFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);

    console.log(`Temporary file deleted: ${filePath}`);
  } catch (error) {
    console.error(
      "Failed to delete temporary file:",
      error.message
    );
  }
};

export default {
  downloadFile,
  deleteFile,
};