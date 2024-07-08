const axios = require("axios");
const { toCorrectChecksumAddress } = require("../utils/utilityHelpers");
const User = require("../models/userModel");
const Logs = require("../models/logsModel");
const moment = require("moment-timezone");
const {
  DAILYREWARD,
  DAILYREWARDESCRIPTION,
  DAILYREWARDESCRIPTION2,
} = require("../const/logs");

const runDailyCron = async () => {
  function isTodayGreaterThanSpecifiedDate() {
    // Define the specified date (2024-07-15) in CET
    const specifiedDateCET = moment.tz("2024-07-14", "YYYY-MM-DD", "CET");
    // Get the current date and time in CET
    const currentDateCET = moment.tz("CET");
    // Compare the dates
    return currentDateCET.isAfter(specifiedDateCET);
  }

  console.log("running daily cron...");
  
  try {
    let data = JSON.stringify({
      query: `query MyQuery {
        EVM(dataset: combined, network: eth) {
          BalanceUpdates(
            orderBy: {descendingByField: "Balance"}
            where: {
              Currency: {SmartContract: {is: "0x51Ee06cE8c5F762B3f826fF433B221438feA74d3"}}
              Block: {Date: {after: "2023-02-01"}}
            }
          ) {
            BalanceUpdate {
              Address
            }
            Balance: sum(of: BalanceUpdate_Amount, selectWhere: {gt: "0"})
          }
        }
      }`,
      variables: "{}",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/graphql",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYzqFA8YGJsBrDEM87K1JkxVekTeDc2",
        Authorization:
          "Bearer ory_at_YBGlP3_3n2doj6T9wTwwwpW5JfLEBpv-QC8bJzpiR-Y.TtThf-CqE5FS4UYjqO_URFUVug-AKJ6h3Me5DbBlfyI",
      },
      data: data,
    };

    const response = await axios.request(config);
    const dota = response.data;
    const balanceUpdates = dota.data.EVM.BalanceUpdates;

    for (const update of balanceUpdates) {
      const balance = update?.Balance;
      const walletAddress = await toCorrectChecksumAddress(update?.BalanceUpdate?.Address);

      if (balance && walletAddress) {
        console.log("> balance:", balance);
        console.log("> Address:", walletAddress);

        const user = await User.findOne({ walletAddress: walletAddress });
        console.log({ user });
        const userRewarded = user?.rewardedBalance ?? 0

        const isAfterDate = isTodayGreaterThanSpecifiedDate();
        console.log({ isAfterDate });

        let percentage = isAfterDate ? 1 : 10;
        let result = (percentage / 100) * balance;
        const body = { lastBalance: +balance };

        if (percentage === 1) {
          console.log("giving 1 percent");
          const newLogs = new Logs({
            walletAddress: walletAddress,
            taskName: DAILYREWARD,
            description: `${DAILYREWARDESCRIPTION2} on balance ${balance}`,
            accruedPoints: +userRewarded+ +balance,
          });
          await newLogs.save();

          body["rewardedBalance"] = +userRewarded+ +balance;
        } else {
          console.log("giving 10 percent");
          const newLogs = new Logs({
            walletAddress: walletAddress,
            taskName: DAILYREWARD,
            description: `${DAILYREWARDESCRIPTION} on balance ${balance}`,
            accruedPoints: +userRewarded+ +balance + result,
          });
          await newLogs.save();

          body["rewardedBalance"] = +userRewarded+ +balance + result;
        }

        if (user) {
          const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: body },
            { new: true }
          );
          console.log("updatedUser:", updatedUser);
        } else {
          const newUser = new User({...body,walletAddress:walletAddress});
          await newUser.save();
        }
      }
    }
  } catch (error) {
    console.error("Error in daily reward cron:", error);
  }
};

module.exports = { runDailyCron };
