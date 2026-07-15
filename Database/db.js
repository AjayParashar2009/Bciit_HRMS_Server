let mongoose = require("mongoose");

let dotenv = require("dotenv");
dotenv.config();
let mongodb_url = process.env.mongo_db_url;
// console.log(mongodb_url)
mongoose
  .connect(mongodb_url)
  .then(() => {
    console.log("Database connect successfully");
  })
  .catch((e) => {
    console.log("Database not connected");
    console.log(e)
  });

module.exports = mongoose;
