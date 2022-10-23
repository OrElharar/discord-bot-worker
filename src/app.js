const express = require("express");
const cors = require("cors");

const errorHandlerMiddleware = require("./middleware/errorHandler");

const botRouter = require("./routers/botRouter");
const userRouter = require("./routers/userRouter");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", botRouter);
app.use("/api/v1", userRouter);

app.use(errorHandlerMiddleware);

module.exports = app;
