const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./db/connect");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

dotenv.config();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

connectDb();

app.listen(process.env.PORT, () => {
  console.log(`server is listen on port ${process.env.PORT}`);
});
