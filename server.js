const express = require("express");
const cors = require("cors");
const app = express();
const { PORT } = require("./config");
require("./db");

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is runing!");
});

const port = PORT || 9000;
console.log("Port: " + port);
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
