const mongoose = require("mongoose");

const auth_schema = mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
      default: () => `USER-${Date.now()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      enum: ["employee", "manager", "admin", "hr", "user"],
      default: "employee",
    },
    employeeId: {
      type: String,
      required: false,
      ref: "Employee",
      sparse: true,
    },
  },
  {
    collection: "auth_data",
    timestamps: true,
  },
);

// Remove confirmPassword from being required
// It should only be used for validation, not stored

const auth_data = mongoose.model("auth_data", auth_schema);
module.exports = auth_data;
