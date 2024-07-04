const { ethers } = require('ethers');
const calculateTotalBric = async (user) => {
  let kycTotal = 0;
  if (user?.isKyc) {
    console.log("notKyc");
    kycTotal = 1000;
  }
  return user?.rewardedBalance + user?.weeklyReward + kycTotal + user?.referredPoints + user?.ambassadorPoint;
};

function toCorrectChecksumAddress(address) {
    try {
        return ethers.utils.getAddress(address);
    } catch (error) {
        return "Invalid Ethereum address";
    }
}

module.exports = { calculateTotalBric, toCorrectChecksumAddress };
