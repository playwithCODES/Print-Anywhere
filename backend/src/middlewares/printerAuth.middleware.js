import crypto from "crypto";
import Printer from "../models/Printer.js";

const printerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Printer token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const printerTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const printer = await Printer.findOne({
      printerTokenHash,
    });

    if (!printer) {
      return res.status(401).json({
        success: false,
        message: "Invalid printer token",
      });
    }

    req.printer = printer;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default printerAuth;