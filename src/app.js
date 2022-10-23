const express = require("express");
const cors = require("cors");

const errorHandlerMiddleware = require("./middleware/errorHandlerMiddleware");
const successHandlerMiddleware = require("./middleware/successHandlerMiddleware");

const botRouter = require("./routers/botRouter");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/bot", botRouter);

app.use(successHandlerMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
