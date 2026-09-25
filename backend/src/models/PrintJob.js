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
    },
  },
  {
    timestamps: true,
  }
);

printJobSchema.index(
  { completedAt: 1 },
  { expireAfterSeconds: 900 }
);

export default mongoose.model("PrintJob", printJobSchema);