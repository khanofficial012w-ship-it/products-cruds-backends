const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `mongoDb connect successfully DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.error("MONGO DB CONNECTION FAILED", error);
    process.exit(1);
  }
};

module.exports = connectDb;
