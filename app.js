let express = require("express");
let app = express();
let router = require("./Routes/Route");
let employee_route = require("./Routes/Employee_route.js");
let cors = require("cors");
let mongoose = require("./Database/db");
let path = require("path");
// const dns =require('node:dns');

// dns.setServers(['8.8.8.8', '8.8.4.4']);


app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("HTTP:" + req.method + req.url);
  next();
});
app.use(
  "/employeeProfile",
  express.static(path.join(__dirname, "employeeProfile")),
);
app.use("/", router);
app.use("/", employee_route);
app.listen(3000, () => {
  console.log("Server is running...");
});
