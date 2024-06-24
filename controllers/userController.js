const User = require("../models/userModel");
const generateToken = require("../utils/tokenHelper");
const { recoverMessageAddress } = require('viem');
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
  console.log("existingUser",existingUser);
  if (existingUser) {
    return res
      .status(200)
      .json({ user: existingUser, token: generateToken(existingUser._id) });
  }
  const newUser = new User({ walletAddress: walletAddress });
  console.log('newUser >> ',newUser)
  await newUser.save();
  return res
    .status(200)
    .json({ user: newUser, token: generateToken(newUser._id) });
};

module.exports = { registerUser };
