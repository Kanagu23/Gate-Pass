
const User = require("../models/Users");

const searchEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId
      ?.trim()
      .toUpperCase();

    if (!employeeId || !/^EMP\d+$/.test(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid employee ID",
      });
    }

    const employee = await User.findOne({
      employeeId,
      role: { $in: ["EMPLOYEE", "DIRECTOR"] },
      isActive: true,
    }).select(
      "_id employeeId name department phone email role"
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee or director not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { searchEmployee };
