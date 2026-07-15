const express = require("express");
const {
  postEmployeeAPI,
  getEmployeeAPI,
  updateEmployeeAPI,
  updateEmployeeAPIbyId,
  deleteEmployeeAPI,
} = require("../Controller/Employee_controller");
let employee_route = express.Router();

const EmployeeProfile = require("../Files/EmployeeImage");
employee_route.post("/api/post/employee", postEmployeeAPI);

employee_route.get("/api/get/employee", getEmployeeAPI);

employee_route.put("/api/update/byemail", EmployeeProfile, updateEmployeeAPI);
employee_route.put("/api/update/byID/:id", updateEmployeeAPIbyId);
employee_route.delete("/api/delete/byID/:id", deleteEmployeeAPI);

module.exports = employee_route;
