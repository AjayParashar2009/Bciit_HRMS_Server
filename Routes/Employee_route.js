const express = require("express");
const {
  postEmployeeAPI,
  getEmployeeAPI,
  getEmployeeById,
  updateEmployeeAPI,
  updateEmployeeAPIbyId,
  deleteEmployeeAPI,
} = require("../Controller/Employee_controller");
const EmployeeProfile = require("../Files/EmployeeImage");

const employee_route = express.Router();

// Employee routes
employee_route.post("/api/post/employee", postEmployeeAPI);
employee_route.get("/api/get/employee", getEmployeeAPI);
employee_route.get("/api/get/byID/:id", getEmployeeById);
employee_route.put("/api/update/byemail", EmployeeProfile, updateEmployeeAPI);
employee_route.put("/api/update/byID/:id", updateEmployeeAPIbyId);
employee_route.delete("/api/delete/byID/:id", deleteEmployeeAPI);

module.exports = employee_route;
