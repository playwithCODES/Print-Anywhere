import printerService from "../services/printer.service.js";

const registerPrinter = async (req, res) => {
  try {
    const { printer, printerToken } =
      await printerService.registerPrinter(req.body, req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Printer registered successfully",
      printer,
      printerToken,
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyPrinters = async (req, res) => {
  try {
    const printers = await printerService.getMyPrinters(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Printers fetched successfully",
      printers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateHeartbeat = async (req, res) => {
  try {
    const { printerId } = req.body;

    const printer = await printerService.updateHeartbeat(
      printerId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Printer heartbeat updated successfully",
      printer,
    });
  } catch (error) {
    if (error.message === "Printer not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  registerPrinter,
  getMyPrinters,
  updateHeartbeat,
};