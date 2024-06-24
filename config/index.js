const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  ERC20_CONTRACT_ADDRESS: process.env.ERC20_CONTRACT_ADDRESS,
};
