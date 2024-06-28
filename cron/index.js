const cron = require("node-cron");
const User = require("../models/userModel");
const getBalance = require("../utils/cryptoHelper");
const moment = require('moment-timezone');
const { runKYCCron } = require('./KYCcron')
const { runGalaxeCron } = require('./galaxe');
const logError = require("../utils/logger");
// const cronSchedule = "*/3 * * * * *";
// let count = 0;
// once every midnight 00:00

const localMidnightCET = moment.tz('00:00', 'HH:mm', 'CET').local().format('HH:mm');
const [localHour, localMinute] = localMidnightCET.split(':').map(Number);

// local time equivalent to 00:00 CET
const cronSchedule =`${localMinute} ${localHour} * * *`;

function isTodayGreaterThanSpecifiedDate() {
  // Define the specified date (2024-07-15) in CET
  const specifiedDateCET = moment.tz("2024-07-14", "YYYY-MM-DD", "CET");
  // Get the current date and time in CET
  const currentDateCET = moment.tz('CET');
  // Compare the dates
  return currentDateCET.isAfter(specifiedDateCET);
}

const cronJob = async () => {
  try {

    // if(count>0) return
    // count ++
    console.log("cron is running");
    const allUSer = await User.find();
    for (const user of allUSer) {
      console.log("for user ", user);
      const { success, tokenbalance } = await getBalance(user.walletAddress);
      if (!success) {
        console.log("returning because fetching balance breaks");
        continue;
      }

      if (tokenbalance !== "0.0") {
        const _ = isTodayGreaterThanSpecifiedDate();
        let percentage = !_ ? 1.1 : 1;
        let result = (percentage / 100) * tokenbalance;
        const body = {
          lastBalance: +tokenbalance,
        };
        // when we get balance and there is no reward 
        // then we add balance to show accumulated reward balance
        if (!user?.rewardedBalance) {
          body["rewardedBalance"] = +tokenbalance + (result);
        }else{
          body["rewardedBalance"] = +user?.rewardedBalance + result
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
      //  add another crons
    }
    runKYCCron()
    runGalaxeCron()
  } catch (error) {
    logError(error)
    console.log("errro in cron job ", error);
  }
};

const job = cron.schedule(cronSchedule, cronJob);
