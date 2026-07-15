let auth_data = require("../Model/auth_schema");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");

let dotenv = require("dotenv");
dotenv.config();

let SECRET_KEY = process.env.SECRET_KEY || "hrms-secret";

// // let Signup = async (req, res) => {
// //   console.log(req.body);
// // let { name, email, password, confirmPassword } = req.body;

// // try {
// //   let existing_user = await auth_data.findOne({ email: email });
// //   if (existing_user) {
// //     res.status(409).json({ success: false, message: "User already exist" });
// //   }
// //   let data = await auth_data({
// //     name: name,
// //     email: email,
// //     password: password,
// //     confirmPassword: confirmPassword,
// //   }).save();
// //   return res
// //     .status(201)
// //     .json({ success: true, message: "Record created successfully" });
// // } catch (error) {
// //   res.status(500).json({ success: false, message: "Something went wrong" });
// // }
// // };
let Signup = async (req, res) => {
  let { name, email, password, confirmPassword, id, role } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password doesn't match" });
    }

    let normalizedEmail = email.toLowerCase();
    let existing_user = await auth_data.findOne({ email: normalizedEmail });
    if (existing_user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exist" });
    }

    let hash_password = await bcrypt.hash(password, 10);
    let hash_confirmPassword = await bcrypt.hash(confirmPassword, 10);

    let data = await auth_data({
      name: name,
      email: normalizedEmail,
      password: hash_password,
      confirmPassword: hash_confirmPassword,
      role: role || "admin",
      id: id || `USER-${Date.now()}`,
    }).save();

    let token = jwt.sign({ email: data.email, role: data.role }, SECRET_KEY);
    return res.status(201).json({
      success: true,
      message: "Registration successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

let Login = async (req, res) => {
  // console.log(req.body);

  let { email, password } = req.body;
  console.log(req.body);
  console.log(SECRET_KEY);
  try {
    let existing_user = await auth_data.findOne({ email: email });
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
        .json({ success: false, message: "Invalid credential" });
    }

    let token = jwt.sign({ email: existing_user.email }, SECRET_KEY);
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      email: existing_user.email,
      id: existing_user.id,
      role: existing_user.role,
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { Login, Signup };
