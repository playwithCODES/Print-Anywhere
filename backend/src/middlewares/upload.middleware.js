import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "image/jpeg",
  "image/png",

  "text/plain",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, image, or text files."
        )
      );
    }

    cb(null, true);
  },
});

export default upload;