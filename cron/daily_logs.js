const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const Logs = require("../models/logsModel");
const runLogsCron = () => {
  const fileKey = "daily_logs.csv";
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  };
  const s3Stream = s3.getObject(params).createReadStream();

  s3Stream
    .pipe(csv())
    .on("data", async (row) => {
      try {
        console.log({ row });
        if (
          row?.["Wallet"] &&
          row?.["Task ID"] &&
          row?.["Task name"] &&
          row?.["Accrued Points"]
        ) {
          const existingLog = await Logs.findOne({
            walletAddress: row["Wallet"],
            taskId: row["Task ID"],
          });
          console.log({ existingLog });
          if (existingLog) {
            const body = {
              taskName: row?.["Task name"],
              accuredPoints: row?.["Accrued Points"],
            };
            const updatedLog = await Logs.findByIdAndUpdate(
              existingLog._id,
              { $set: body },
              { new: true }
            );
          } else {
            const newLog = new Logs({
              walletAddress: row?.["Wallet"],
              taskId: row?.["Task ID"],
              taskName: row?.["Task name"],
              accuredPoints: row?.["Accrued Points"],
            });
            await newLog.save();
          }
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

module.exports = { runLogsCron };
