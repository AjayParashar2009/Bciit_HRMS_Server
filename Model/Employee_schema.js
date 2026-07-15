const mongoose = require("mongoose");

const empSchema = new mongoose.Schema(
  {
    EmpId: {
      type: String,
      required: true,
      unique: true,
    },

    EmpName: {
      type: String,
      required: true,
    },

    Gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    DOB: {
      type: String,
      required: true,
    },

    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    ContactNumber: {
      type: String,
      required: true,
    },

    EmpDepartment: {
      type: String,
      required: true,
    },

    Salary: {
      type: Number,
      required: true,
      min: 0,
    },

    JoiningDate: {
      type: String,
      required: true,
    },

    Designation: {
      type: String,
      required: true,
    },
    empImage: {
      type: String,
      required: true,
    },
  },
  {
    collection: "employees",
    timestamps: true,
  },
);

module.exports = mongoose.model("Employee", empSchema);
