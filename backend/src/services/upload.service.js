import { Readable } from "stream";

import cloudinary from "../config/cloudinary.js";

const uploadDocument = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "PrintAnywhere",
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export default {
  uploadDocument,
};