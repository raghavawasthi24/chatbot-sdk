import mongoose, { ConnectOptions } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const DB_URL: string = process.env.MONGO_URI || "mongodb://localhost:27017/";

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("============ DATABASE CONNECTED SUCCESSFULLY =============");
  })
  .catch((err: Error) => {
    console.log(err.message);
  });
