const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    isKyc: {
      type: Boolean,
      default: false,
    },
    isKycPaid: {
      type: Boolean,
      default: false,
    },
    kycDate: {
      type: Date,
      default: new Date("1995-01-01"),
    },
    referredPoints: {
      type: Number,
      default: 0,
    },
    lastBalance: {
      type: Number,
      default: 0,
    },
    rewardedBalance: {
      type: Number,
      default: 0,
    },
    weeklyReward: {
      type: Number,
      default: 0,
    },
    isAmbassador: {
      type: Boolean,
      default: false,
    },
    ambassadorPoint: {
      type: Number,
      default: 0,
    },
    signatureHash: {
      type: String,
    },
    referredFriends: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
