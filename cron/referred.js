const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const User = require("../models/userModel");
const runRefferedCron = () => {
  const fileKey = "referred.csv";
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
        if (row?.["Wallet"] && row?.["Amount of points to reward"]) {
          const user = await User.findOne({ walletAddress: row["Wallet"] });
          console.log({ user });
          // user not exist in DB
          if (!user) {
            const newUser = new User({
              walletAddress: row?.["Wallet"],
              referredPoints: +row?.["Amount of points to reward"],
            });
            await newUser.save();
          } else {
            const body = {
              referredPoints: +row?.["Amount of points to reward"],
            };
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { $set: body },
              { new: true }
            );
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

module.exports = { runRefferedCron };
