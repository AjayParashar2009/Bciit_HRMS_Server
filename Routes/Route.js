const express = require("express");
let {Login,Signup} = require("../Controller/Auth");
let route = express.Router();


route.post("/api/login", Login);
route.post("/api/signup",Signup);

module.exports = route;
