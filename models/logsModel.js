const mongoose = require("mongoose");

const logsSchema = mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: false,
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
    decription: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logsSchema);

module.exports = Log;
