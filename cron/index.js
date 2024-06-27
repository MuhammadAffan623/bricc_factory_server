const cron = require("node-cron");
const User = require("../models/userModel");
const getBalance = require("../utils/cryptoHelper");
// const cronSchedule = "*/3 * * * * *";
// let count = 0;
// once every midnight 00:00
const cronSchedule = "0 0 * * *";
function isDateAfter7July() {
  const targetDate = new Date("2024-07-15");
  const currentDate = new Date();

  // Remove the time part for an accurate comparison
  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (currentDate < targetDate) {
    return false;
  }
  return true;
}
const cronJob = async () => {
  // if (count > 0) return;
  // count++;
  try {
    console.log("cron is running");
    const allUSer = await User.find();
    for (const user of allUSer) {
      console.log("for user ", user);
      const { success, tokenbalance } = await getBalance(user.walletAddress);
      if (!success) {
        console.log("returning because fetching balance breaks");
        continue;
      }
      console.log("tokenbalance ", typeof tokenbalance);
      console.log("tokenbalance ", tokenbalance);
      if (tokenbalance !== "0.0") {
        console.log("giving reward on balance");
        const _ = isDateAfter7July();
        console.log("isDateAfter7July", _);

        let percentage = !_ ? 1.1 : 1;
        let result = (percentage / 100) * tokenbalance;
        console.log("type of ", typeof result);
        const body = {
          lastBalance: +tokenbalance,
        };
        const ball = +tokenbalance - +user.lastBalance;
        if (ball > 0) {
          body["rewardedBalance"] = ball + (user.rewardedBalance + result);
        }

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: body },
          { new: true }
        );
        console.log("updatedUser :", updatedUser);
      } else {
        console.log("on unstake changing reward price back to 0");
        const body = {
          rewardedBalance: 0,
          lastBalance: 0,
        };

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: body },
          { new: true }
        );
        console.log("updatedUser :", updatedUser);
      }
    }
  } catch (error) {
    console.log("errro in cron job ", error);
  }
};

const job = cron.schedule(cronSchedule, cronJob);
