const Employee = require("../Model/Employee_schema");
const auth_data = require("../Model/auth_schema");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

// ========== CREATE EMPLOYEE ==========
const postEmployeeAPI = async (req, res) => {
  console.log("=== NEW EMPLOYEE CREATION REQUEST ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const {
    EmpId,
    EmpName,
    Gender,
    DOB,
    Email,
    ContactNumber,
    EmpDepartment,
    Salary,
    JoiningDate,
    Designation,
    hasAccount,
    accountData,
  } = req.body;

  try {
    // Validate required fields
    const requiredFields = [
      "EmpId",
      "EmpName",
      "Gender",
      "DOB",
      "Email",
      "ContactNumber",
      "EmpDepartment",
      "Salary",
      "JoiningDate",
      "Designation",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for existing employee
    const existingEmployee = await Employee.findOne({
      $or: [{ EmpId }, { Email: Email.toLowerCase() }],
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee with this ID or Email already exists",
      });
    }

    // Prepare employee data
    const employeeData = {
      EmpId,
      EmpName,
      Gender,
      DOB,
      Email: Email.toLowerCase(),
      ContactNumber,
      EmpDepartment,
      Salary: Number(Salary),
      JoiningDate,
      Designation,
      hasAccount: hasAccount || false,
      empImage: null, // Default value
    };

    // If account creation is requested
    if (hasAccount && accountData) {
      // Check if account already exists
      const existingAccount = await auth_data.findOne({
        $or: [
          { email: Email.toLowerCase() },
          { username: accountData.username },
        ],
      });

      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: "Account with this email or username already exists",
        });
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
        employeeId: EmpId,
      });

      await newAccount.save();
      employeeData.accountId = newAccount._id;
    }

    // Create employee
    const newEmployee = await Employee.create(employeeData);

    return res.status(201).json({
      success: true,
      message: hasAccount
        ? "Employee and account created successfully"
        : "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.error("=== EMPLOYEE CREATION ERROR ===");
    console.error("Error:", error);

    // Handle specific Mongoose errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation error: " + errors.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate field: " + Object.keys(error.keyValue).join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========== GET ALL EMPLOYEES ==========
const getEmployeeAPI = async (req, res) => {
  try {
    const data = await Employee.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ========== UPDATE EMPLOYEE BY EMAIL ==========
const updateEmployeeAPI = async (req, res) => {
  console.log("Update employee by email:", req.body);

  const {
    EmpId,
    EmpName,
    Gender,
    DOB,
    Email,
    ContactNumber,
    EmpDepartment,
    Salary,
    JoiningDate,
    Designation,
  } = req.body;

  try {
    const employee = await Employee.findOne({ Email });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updateData = {
      EmpId,
      EmpName,
      Gender,
      DOB,
      Email: Email.toLowerCase(),
      ContactNumber,
      EmpDepartment,
      Salary: Number(Salary),
      JoiningDate,
      Designation,
    };

    if (req.files?.empImage) {
      updateData.empImage = req.files.empImage[0].filename;
    }

    await Employee.updateOne({ Email }, { $set: updateData });

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ========== UPDATE EMPLOYEE BY ID ==========
const updateEmployeeAPIbyId = async (req, res) => {
  console.log("Updating employee with ID:", req.params.id);

  const { id } = req.params;
  const {
    EmpId,
    EmpName,
    Gender,
    DOB,
    Email,
    ContactNumber,
    EmpDepartment,
    Salary,
    JoiningDate,
    Designation,
  } = req.body;

  try {
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        EmpId,
        EmpName,
        Gender,
        DOB,
        Email: Email?.toLowerCase(),
        ContactNumber,
        EmpDepartment,
        Salary: Number(Salary),
        JoiningDate,
        Designation,
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ========== DELETE EMPLOYEE ==========
const deleteEmployeeAPI = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.accountId) {
      await auth_data.findByIdAndDelete(employee.accountId);
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ========== GET EMPLOYEE BY ID ==========
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ========== EXPORT ==========
module.exports = {
  postEmployeeAPI,
  getEmployeeAPI,
  getEmployeeById,
  updateEmployeeAPI,
  updateEmployeeAPIbyId,
  deleteEmployeeAPI,
};
