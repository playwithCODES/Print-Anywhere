import mongoose from "mongoose";

const printerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    printerId: {
      type: String,
      required: true,
      unique: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    printerTokenHash: {
      type: String,
      required: true,
    },

    tokenCreatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Printer", printerSchema);