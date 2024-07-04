const { s3, S3_BUCKET_NAME } = require("../config");
const csv = require("csv-parser");
const Partner = require("../models/partnerModels");
const runPartnerProjectCron = () => {
  const fileKey = "partner_project.csv";
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
          row?.["Name of partner project"] &&
          row?.["Description of the task"] &&
          row?.["Tooltip text"] &&
          row?.["Amount of points to reward"] &&
          row?.["Date of snapshot"]
        ) {
          const existingPartner = await Partner.findOne({
            walletAddress: row?.["Wallet"]?.toUpperCase(),
          });
          console.log({ existingPartner });
          // existingPartner not exist in DB
          if (!existingPartner) {
            const newpartner = new Partner({
              walletAddress: row?.["Wallet"]?.toUpperCase(),
              projectName: row?.["Name of partner project"],
              description: row?.["Description of the task"],
              tooltip: row?.["Tooltip text"],
              snapshotDate: new Date(row["Date of snapshot"]),
              rewardsPoint: +row?.["Amount of points to reward"],
            });
            await newpartner.save()
          } else {
            const body = {
              projectName: row?.["Name of partner project"],
              description: row?.["Description of the task"],
              tooltip: row?.["Tooltip text"],
              snapshotDate: new Date(row["Date of snapshot"]),
              rewardsPoint: +row?.["Amount of points to reward"],
            };
            const updatedPartner = await Partner.findByIdAndUpdate(
              existingPartner._id,
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

module.exports = { runPartnerProjectCron };
