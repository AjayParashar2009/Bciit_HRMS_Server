// const emp_data = require("../Model/Employee_schema");

// const postEmployeeAPI = async (req, res) => {
//   const { name, ID, phone, email, address, DOB, salary } = req.body;

//   try {
//     if (!name || !ID || !phone || !email || !address || !DOB || !salary) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }
//     let existing_user = await emp_data.findOne({ ID: ID });
//     if (existing_user) {
//       return res
//         .status(409)
//         .json({ success: false, message: "User already exist" });
//     }
//     const data = await emp_data.create({
//       name: name,
//       ID: ID,
//       phone: phone,
//       email: email,
//       address: address,
//       DOB: DOB,
//       salary: salary,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Record Created Successfully",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

// let getEmployeeAPI = async (req, res) => {
//   try {
//     let data = await emp_data.find();

//     return res.status(200).json({
//       success: true,
//       message: "Records fetched successfully",
//       data,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

// let updateEmployeeAPI = async (req, res) => {
//   try {
//     const { name, ID, phone, email, address, DOB, salary } = req.body;
//     let existing_emp = await emp_data.findOne({ email: email });
//     if (!existing_emp) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Record not found" });
//     }

//     let updateEmployee = await emp_data.updateOne(
//       { email: email },
//       {
//         $set: {
//           name: name,
//           ID: ID,
//           phone: phone,
//           email: email,
//           address: address,
//           DOB: DOB,
//           salary: salary,
//         },
//       },
//     );
//     return res
//       .status(200)
//       .json({ success: true, message: "Record update successfully" });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Something went wrong" });
//   }
//   console.log(req.body);
// };

// let updateEmployeeAPIbyId = async (req, res) => {
//   let { id } = req.params;
//   const { name, ID, phone, email, address, DOB, salary } = req.body;

//   try {
//     let update_employee = await emp_data.findByIdAndUpdate(id, {
//       name: name,
//       ID: ID,
//       phone: phone,
//       email: email,
//       address: address,
//       DOB: DOB,
//       salary: salary,
//     });

//     if (!update_employee) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Record not found" });
//     }

//     return res
//       .status(200)
//       .json({ success: true, message: "Record updated successfully" });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "something went wrong" });
//   }
// };
// module.exports = {
//   postEmployeeAPI,
//   getEmployeeAPI,
//   updateEmployeeAPI,
//   updateEmployeeAPIbyId,
// };

const Employee = require("../Model/Employee_schema");

// Create Employee
const postEmployeeAPI = async (req, res) => {
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
    if (
      !EmpId ||
      !EmpName ||
      !Gender ||
      !DOB ||
      !Email ||
      !ContactNumber ||
      !EmpDepartment ||
      !Salary ||
      !JoiningDate ||
      !Designation
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ EmpId }, { Email }],
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee already exists",
      });
    }

    await Employee.create({
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
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get All Employees
const getEmployeeAPI = async (req, res) => {
  try {
    const data = await Employee.find();

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update Employee using Email
const updateEmployeeAPI = async (req, res) => {
  // console.log(req.body);
  console.log("file name is:" + req.files.empImage[0]);

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
    console.log(employee.empImage);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
        empImage
      });
    }

    if (req.files?.empImage) {
      const empImage = req.files.empImage[0].filename;

      await Employee.updateOne(
        { Email },
        {
          $set: {
            empImage,
          },
        },
      );
      return res
        .status(200)
        .json({ success: true, message: "Profile image update successfully" });
    }

    await Employee.updateOne(
      { Email: Email },
      {
        $set: {
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
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update Employee by MongoDB _id
const updateEmployeeAPIbyId = async (req, res) => {
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
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true },
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteEmployeeAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Employee.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Record delete successfully" });
    }
    return res
      .status(404)
      .json({ success: false, message: "Record not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  postEmployeeAPI,
  getEmployeeAPI,
  updateEmployeeAPI,
  updateEmployeeAPIbyId,
  deleteEmployeeAPI,
};
