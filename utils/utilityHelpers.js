const calculateTotalBric = async (user) => {
  let kycTotal = 0;
  if (user.isKyc) {
    console.log("notKyc");
    kycTotal = 1000;
  }
  return user.rewardedBalance + user.weeklyReward + kycTotal;
};

module.exports = { calculateTotalBric };
