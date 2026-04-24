const express = require("express");
const cors = require("cors");
const sheltersRouter = require("./routes/shelters");
const requestsRouter = require("./routes/requests");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/shelters", sheltersRouter);
app.use("/api/requests", requestsRouter);

module.exports = app;
