const { s3, S3_BUCKET_NAME } = require("../config");
const Logs = require("../models/logsModel");
const { Parser } = require("json2csv");
const runLogsCron = async () => {
  try {
    const fileKey = "daily_logs.csv";

    const logs = await Logs.find({});

    if (!logs.length) {
      return res.status(404).send("No logs found.");
    }
    const fields = [
      { label: "Wallet", value: "walletAddress" },
      { label: "Task ID", value: "_id" },
      { label: "Task name", value: "taskName" },
      { label: "Accrued Points", value: "accuredPoints" },
    ];
    const json2csvParser = new Parser({ fields, quote: "" });
    const csv = json2csvParser.parse(logs);
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      Body: csv,
      ContentType: "text/csv",
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading to S3:", err);
      }
      console.log("File uploaded successfully:", data.Location);
    });
  } catch (err) {
    console.error("Error in logs cron:", err);
  }
};

module.exports = { runLogsCron };
