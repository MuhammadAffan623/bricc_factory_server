const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const User = require("../models/userModel");
const Logs = require("../models/logsModel");
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
        if (row?.Address && row?.BricAmount) {
          const user = await User.findOne({ walletAddress: row?.Address });
          console.log({ user, row });
          // user not exist in DB
          if (!user) return;
          const body = {
            weeklyReward: +row?.BricAmount,
          };
          const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: body },
            { new: true }
          );
          const newLogs = new Logs({
            walletAddress: row?.Address,
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
