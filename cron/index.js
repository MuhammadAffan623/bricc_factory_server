const cron = require("node-cron");
const User = require("../models/userModel");
const getBalance = require("./getBalance");
const cronSchedule = "*/3 * * * * *";

const cronJob = async () => {
  try {
    console.log("cron is running",getBalance());
  } catch (error) {
    console.log("errro in cron job ");
  }
};

// Create the cron job
const job = cron.schedule(cronSchedule, cronJob);
function checkDate() {
  const targetDate = new Date("2024-07-13");
  const currentDate = new Date("2024-07-13");

  // Remove the time part for an accurate comparison
  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (currentDate < targetDate) {
    return "The current date is before July 13, 2024.";
  } else if (currentDate > targetDate) {
    return "The current date is after July 13, 2024.";
  } else {
    return "The current date is July 13, 2024.";
  }
}
