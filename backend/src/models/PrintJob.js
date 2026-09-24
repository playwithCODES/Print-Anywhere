import mongoose from "mongoose";

const printJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    printer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printer",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    copies: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["queued", "printing", "completed", "failed"],
      default: "queued",
    },

    completedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PrintJob", printJobSchema);