const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const User = require("../models/userModel");
const Logs = require("../models/logsModel");
const runKYCCron = () => {
  const fileKey = "KYC.csv";
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  };

  const s3Stream = s3.getObject(params).createReadStream();

  s3Stream
    .pipe(csv())
    .on("data", async (row) => {
      try {
        if (row?.Address) {
          const user = await User.findOne({ walletAddress: row?.Address });
          console.log({ user });
          console.log('row?.Address ---',row?.Address)
          // user not exist in DB
          if (!user) {
            const newUser = new User({
              walletAddress: row?.Address,
              isKyc: true,
              kycDate: new Date(),
            });
            await newUser.save();
          } else {
            // if kyc is not done
            if (!user.isKyc) {
              const body = {
                isKyc: true,
                kycDate: new Date(),
              };
              const updatedUser = await User.findByIdAndUpdate(
                user._id,
                { $set: body },
                { new: true }
              );
              const newLogs = new Logs({
                walletAddress: row?.Address,
                taskName: "performing kyc",
                decription: `giving 1000 rewards point to a user `,
                accuredPoints: 1000,
              });
              await newLogs.save();
            }
          }
        }
      } catch (error) {
        console.error("Error processing row:", error);
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    })
    .on("error", (error) => {
      console.error("Error reading from S3:", error);
    });
};

module.exports = { runKYCCron };
