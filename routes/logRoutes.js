const express = require("express");
const router = express.Router();
const Logs = require("../models/logsModel");
router.get("/", async (req, res) => {
  try {
    const allLogs = await Logs.find();
    return res.status(200).json({ allLogs });
  } catch (error) {
    console.error("Error fetching Logs: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
