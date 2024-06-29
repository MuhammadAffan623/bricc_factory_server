const User = require("../models/userModel");
const generateToken = require("../utils/tokenHelper");
const { recoverMessageAddress } = require("viem");
const { calculateTotalBric } = require("../utils/utilityHelpers");

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
  const existingUser = await User.findOne({ walletAddress: walletAddress });
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
  const newUser = new User({ walletAddress: walletAddress });
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
module.exports = { registerUser, getUserFromToken };
