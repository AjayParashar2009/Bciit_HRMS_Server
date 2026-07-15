let mongoose = require("mongoose");

let auth_schema = mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
  },
  { collection: "auth_data" },
);

let auth_data = mongoose.model("auth_data", auth_schema);

module.exports = auth_data;
