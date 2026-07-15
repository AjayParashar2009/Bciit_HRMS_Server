const Employee = require("../Model/Employee_schema");
const { createEmployeeAccount } = require("./Auth");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

// Create Employee with optional account
const postEmployeeAPI = async (req, res) => {
  console.log("Received employee data:", req.body);
  
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
    accountData
  } = req.body;

  try {
    // Validate required fields
    const requiredFields = ['EmpId', 'EmpName', 'Gender', 'DOB', 'Email', 'ContactNumber', 'EmpDepartment', 'Salary', 'JoiningDate', 'Designation'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
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
      empImage: null
    };

    // If account creation is requested
    if (hasAccount && accountData) {
      try {
        // Create account using the auth service
        const account = await createEmployeeAccount({
          EmpName,
          Email,
          accountData,
          EmpId
        });
        employeeData.accountId = account._id;
      } catch (accountError) {
        return res.status(409).json({
          success: false,
          message: accountError.message || "Failed to create account"
        });
      }
    }

    // Create employee
    const newEmployee = await Employee.create(employeeData);

    return res.status(201).json({
      success: true,
      message: hasAccount ? 'Employee and account created successfully' : 'Employee created successfully',
      data: newEmployee
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};


// Create Employee
const postEmployeeAPI = async (req, res) => {
  console.log("Received employee data:", req.body);

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
    // Validate required fields (empImage is NOT required anymore)
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
      empImage: null, // Default image
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
    console.error("Error creating employee:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get All Employees
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

// Update Employee using Email (with image upload)
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

    // Prepare update data
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

    // If image is uploaded
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

// Update Employee by MongoDB _id
const updateEmployeeAPIbyId = async (req, res) => {
  console.log("Updating employee with ID:", req.params.id);
  console.log("Update data:", req.body);

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
    // Check if employee exists
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update employee
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

// Delete Employee
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

    // Also delete associated account if exists
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

// Get Employee by ID
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

module.exports = {
  postEmployeeAPI,
  getEmployeeAPI,
  getEmployeeById,
  updateEmployeeAPI,
  updateEmployeeAPIbyId,
  deleteEmployeeAPI,
};
