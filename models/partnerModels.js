const mongoose = require("mongoose");

const partnerSchema = mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    projectName: {
      type: String,
    },
    snapshotDate: {
      type: Date,
      default: new Date("1995-01-01"),
    },
    description: {
      type: String,
    },
    tooltip: {
      type: String,
    },
    rewardsPoint: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
