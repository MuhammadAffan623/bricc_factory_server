const User = require("../models/userModel");
const generateToken = require("../utils/tokenHelper");
const { recoverMessageAddress } = require("viem");
const { calculateTotalBric } = require("../utils/utilityHelpers");
const { runKYCCron } = require("../cron/KYCcron");
const { runGalaxeCron } = require("../cron/galaxe");
const { runAmbassadorCron } = require("../cron/ambassador");
const { runPartnerProjectCron } = require("../cron/partner_project");
const { runLogsCron } = require("../cron/daily_logs");
const { runRefferedCron } = require("../cron/referred");
const registerUser = async (req, res) => {
  console.log("registerUser function");
  const message = req.body.message;
  const signature = req.body.signature;
  if (!message || !signature) {
    res.status(400);
    return res.json({ message: "Message and signature is required" });
  }
  const walletAddress = await recoverMessageAddress({
    message,
    signature,
  });

  const existingUser = await User.findOne({ walletAddress: walletAddress?.toUpperCase() });
  console.log("existingUser", existingUser);
  if (existingUser) {
    const totalBrics = await calculateTotalBric(existingUser);
    const userWithTotalBric = {
      ...existingUser.toObject(),
      totalBrics,
    };
    return res.status(200).json({
      user: userWithTotalBric,
      token: generateToken(existingUser._id),
    });
  }
  const newUser = new User({
    walletAddress: walletAddress,
    signatureHash: signature,
  });
  console.log("newUser >> ", newUser);
  await newUser.save();
  const totalBrics = await calculateTotalBric(existingUser);
  const userWithTotalBric = {
    ...newUser.toObject(),
    totalBrics,
  };
  return res
    .status(200)
    .json({ user: userWithTotalBric, token: generateToken(newUser._id) });
};
const getUserFromToken = async (req, res) => {
  if (req?.user?._id) {
    const totalBrics = await calculateTotalBric(req?.user);
    const userWithTotalBric = {
      ...req?.user?.toObject(),
      totalBrics,
    };
    return res.json({ user: userWithTotalBric });
  }
  return res.status(400).json({ message: "Invalid token" });
};

const runAllCron = async (req, res) => {
  try {
    console.log("runing all cron");

    await runKYCCron();
    await runGalaxeCron();
    await runAmbassadorCron();
    await runPartnerProjectCron();
    await runLogsCron();
    await runRefferedCron();
    return res.status(200).json({ message: "all cron's are running" });
  } catch (e) {
    return res.status(400).json({ error: e?.message });
  }
};
module.exports = { registerUser, getUserFromToken, runAllCron };
