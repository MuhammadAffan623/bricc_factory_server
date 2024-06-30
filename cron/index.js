const cron = require("node-cron");
const User = require("../models/userModel");
const getBalance = require("../utils/cryptoHelper");
const moment = require("moment-timezone");
const { runKYCCron } = require("./KYCcron");
const { runGalaxeCron } = require("./galaxe");
const logError = require("../utils/logger");
const { runAmbassadorCron } = require("./ambassador");
const { runPartnerProjectCron } = require("./partner_project");
const { runLogsCron } = require("./daily_logs");
const { runRefferedCron } = require("./referred");
const Logs = require("../models/logsModel");
const {
  DAILYREWARD,
  DAILYREWARDESCRIPTION,
  DAILYREWARDESCRIPTION2,
} = require("../const/logs");

// const cronSchedule = "*/3 * * * * *";
// let count = 0;
// once every midnight 00:00

const localMidnightCET = moment
  .tz("00:00", "HH:mm", "CET")
  .local()
  .format("HH:mm");
const [localHour, localMinute] = localMidnightCET.split(":").map(Number);

// local time equivalent to 00:00 CET
const cronSchedule = `${localMinute} ${localHour} * * *`;

function isTodayGreaterThanSpecifiedDate() {
  // Define the specified date (2024-07-15) in CET
  const specifiedDateCET = moment.tz("2024-07-14", "YYYY-MM-DD", "CET");
  // Get the current date and time in CET
  const currentDateCET = moment.tz("CET");
  // Compare the dates
  return currentDateCET.isAfter(specifiedDateCET);
}

const cronJob = async () => {
  try {
    // if (count > 0) return;
    // count++;
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
        let percentage = !_ ? 10 : 1;
        let result = (percentage / 100) * tokenbalance;
        const body = {
          lastBalance: +tokenbalance,
        };
        if (result === 1) {
          console.log("giving 1 percent");
          const newLogs = new Logs({
            walletAddress: user.walletAddress,
            taskName: DAILYREWARD,
            decription: `${DAILYREWARDESCRIPTION2} on balance ${tokenbalance} `,
            accuredPoints: +user?.rewardedBalance + +tokenbalance,
          });
          await newLogs.save();

          body["rewardedBalance"] = +user?.rewardedBalance + +tokenbalance;
        } else {
          console.log("giving 10 percent");
          const newLogs = new Logs({
            walletAddress: user.walletAddress,
            taskName: DAILYREWARD,
            decription: `${DAILYREWARDESCRIPTION} on balance ${tokenbalance} `,
            accuredPoints: +user?.rewardedBalance + +tokenbalance + result,
          });
          await newLogs.save();
          body["rewardedBalance"] =
            +user?.rewardedBalance + +tokenbalance + result;
        }
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: body },
          { new: true }
        );
        console.log("updatedUser :", updatedUser);
      }
      //  add another crons
    }
    runKYCCron();
    runGalaxeCron();
    runAmbassadorCron();
    runPartnerProjectCron();
    runLogsCron();
    runRefferedCron();
  } catch (error) {
    logError(error);
    console.log("errro in cron job ", error);
  }
};

const job = cron.schedule(cronSchedule, cronJob);
