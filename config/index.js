const path = require("path");
const AWS = require('aws-sdk');
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  ERC20_CONTRACT_ADDRESS: process.env.ERC20_CONTRACT_ADDRESS,
  s3,
  S3_BUCKET_NAME : process.env.S3_BUCKET_NAME

};
