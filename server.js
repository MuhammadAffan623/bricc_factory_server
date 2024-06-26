const express = require("express");
const cors = require("cors");
const app = express();
const { PORT } = require("./config");
require("./db");
const userRoutes = require("./routes/userRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const logsRoutes = require("./routes/logRoutes");
require("./cron/index");
app.use(cors());
app.options('*', cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is runing!");
});
app.use("/api/user", userRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/logs", logsRoutes);

const port = PORT || 9000;
console.log("Port: " + port);
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
