const fs = require('fs');
const path = require('path');

const logError = (error) => {
  // Path to the logs directory one level up
  const logsDir = path.join(__dirname, '..', 'logs');

  // Ensure the logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const logFilePath = path.join(logsDir, 'error.log');
  const errorLog = `[${new Date().toISOString()}] ${error.stack || error}\n`;

  fs.appendFile(logFilePath, errorLog, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

module.exports = logError;
