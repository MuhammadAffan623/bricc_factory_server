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
const {runDailyCron} = require("./dailyReward");
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



const cronJob = async () => {
  try {
    // if (count > 0) return;
    // count++;

    runKYCCron();
    runGalaxeCron();
    runAmbassadorCron();
    runPartnerProjectCron();
    runLogsCron();
    runRefferedCron();
    runDailyCron()
  } catch (error) {
    logError(error);
    console.log("errro in cron job ", error);
  }
};

const job = cron.schedule(cronSchedule, cronJob);
