const mongoose = require("mongoose");

const logsSchema = mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    taskId: {
      type: String,
    },
    taskName: {
      type: String,
    },
    accuredPoints: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logsSchema);

module.exports = Log;
