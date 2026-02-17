const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./db/connect");
const app = express();
dotenv.config();
connectDb();

app.listen(process.env.PORT, () => {
  console.log(`server is listen on port ${process.env.PORT}`);
});
