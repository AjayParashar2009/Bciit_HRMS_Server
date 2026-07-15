let auth_data = require("../Model/auth_schema");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let dotenv = require("dotenv");
dotenv.config();

let SECRET_KEY = process.env.SECRET_KEY || "hrms-secret";

// Signup for standalone account creation
let Signup = async (req, res) => {
  let { name, email, password, confirmPassword, id, role, username } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and confirm password are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords don't match" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let normalizedEmail = email.toLowerCase();

    // Check if user already exists
    let existing_user = await auth_data.findOne({
      $or: [{ email: normalizedEmail }, { username: username }],
    });

    if (existing_user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    let hash_password = await bcrypt.hash(password, 10);

    // Create new user
    let data = await auth_data({
      name: name,
      email: normalizedEmail,
      username: username || name.toLowerCase().replace(/\s/g, ""),
      password: hash_password,
      role: role || "employee",
      id: id || `USER-${Date.now()}`,
    }).save();

    // Generate JWT token
    let token = jwt.sign(
      { email: data.email, role: data.role, id: data.id },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

// Login
let Login = async (req, res) => {
  let { email, password } = req.body;
  console.log("Login attempt:", { email });

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let normalizedEmail = email.toLowerCase();
    let existing_user = await auth_data.findOne({ email: normalizedEmail });

    if (!existing_user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let matched_password = await bcrypt.compare(
      password,
      existing_user.password,
    );

    if (!matched_password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    let token = jwt.sign(
      {
        email: existing_user.email,
        role: existing_user.role,
        id: existing_user.id,
      },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      email: existing_user.email,
      id: existing_user.id,
      role: existing_user.role,
      token: token,
      user: {
        id: existing_user.id,
        name: existing_user.name,
        email: existing_user.email,
        role: existing_user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// Create account for employee (used by employee creation)
let createEmployeeAccount = async (employeeData) => {
  try {
    const { EmpName, Email, accountData } = employeeData;

    // Check if account already exists
    const existingAccount = await auth_data.findOne({
      $or: [{ email: Email.toLowerCase() }, { username: accountData.username }],
    });

    if (existingAccount) {
      throw new Error("Account with this email or username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(accountData.password, 10);

    // Create account
    const newAccount = new auth_data({
      id: `ACC-${Date.now()}`,
      name: EmpName,
      email: Email.toLowerCase(),
      username: accountData.username,
      password: hashedPassword,
      role: accountData.role || "employee",
      employeeId: employeeData.EmpId,
    });

    await newAccount.save();
    return newAccount;
  } catch (error) {
    throw error;
  }
};

module.exports = { Login, Signup, createEmployeeAccount };
