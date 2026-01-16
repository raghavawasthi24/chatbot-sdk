"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/";
mongoose_1.default
    .connect(DB_URL)
    .then(() => {
    console.log("============ DATABASE CONNECTED SUCCESSFULLY =============");
})
    .catch((err) => {
    console.log(err.message);
});
