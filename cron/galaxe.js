const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const User = require("../models/userModel");
const Logs = require("../models/logsModel");
const { toCorrectChecksumAddress } = require("../utils/utilityHelpers");
const runGalaxeCron = () => {
  const fileKey = "Galxe.csv";
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  };

  const s3Stream = s3.getObject(params).createReadStream();

  s3Stream
    .pipe(csv())
    .on("data", async (row) => {
      try {
        console.log("galxe");
        if (row?.Address && row?.BricAmount) {
          console.log("in ga;axe cron---");
          const user = await User.findOne({ walletAddress: toCorrectChecksumAddress(row?.Address) });
          console.log({ user, row });
          // user not exist in DB
          if (!user) {
            const newUser = new User({
              weeklyReward: +row?.BricAmount,
              walletAddress: toCorrectChecksumAddress(row?.Address) ,
            });
            await newUser.save();
          } else {
            const body = {
              weeklyReward: +row?.BricAmount,
            };
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { $set: body },
              { new: true }
            );
          }
          const newLogs = new Logs({
            walletAddress:toCorrectChecksumAddress(row?.Address) ,
            taskName: " Galaxe cron ",
            decription: `giving ${+row?.BricAmount} rewards point to a user `,
            accuredPoints: +row?.BricAmount,
          });
          await newLogs.save();
        }
      } catch (error) {
        console.error("Error processing weeklyReward row:", error);
      }
    })
    .on("end", () => {
      console.log("CSV weeklyReward file successfully processed");
    })
    .on("error", (error) => {
      console.error("Error reading from S3:", error);
    });
};

module.exports = { runGalaxeCron };
