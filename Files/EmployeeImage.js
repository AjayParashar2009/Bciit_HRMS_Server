const multer = require("multer");

const storage1 = multer.diskStorage({
  destination: "employeeProfile",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const EmployeeProfile = multer({
  storage: storage1,
}).fields([{ name: "empImage" }]);

module.exports = EmployeeProfile;
