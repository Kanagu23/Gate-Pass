
const Department = require("../models/Departments");
const User = require("../models/Users");

const createDepartment = async (req, res) => {
  try {
    const { code, name, description } = req.body;

    if (
      typeof code !== "string" ||
      !code.trim() ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Department code and name are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();

    const existing = await Department.findOne({
      $or: [
        { code: normalizedCode },
        { name: normalizedName },
      ],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Department code or name already exists",
      });
    }

    const department = await Department.create({
      code: normalizedCode,
      name: normalizedName,
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Department code or name already exists",
      });
    }

    console.error("Create department error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create department",
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("head", "employeeId name email department")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch departments",
    });
  }
};


const assignDepartmentHead = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { employeeId } = req.body;

    if (
      typeof employeeId !== "string" ||
      !employeeId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const department = await Department.findById(
      departmentId
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (!department.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign a head to an inactive department",
      });
    }

    const employee = await User.findOne({
      employeeId: employeeId.trim().toUpperCase(),
      role: { $in: ["EMPLOYEE", "DIRECTOR"] },
      isActive: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Active employee or director not found",
      });
    }

    // Existing Users model stores department as a string.

const employeeDepartment = employee.department
  ?.trim()
  .toLowerCase();

const departmentCode = department.code
  ?.trim()
  .toLowerCase();

const departmentName = department.name
  ?.trim()
  .toLowerCase();

const belongsToDepartment =
  employeeDepartment === departmentCode ||
  employeeDepartment === departmentName;

if (!belongsToDepartment) {
  return res.status(400).json({
    success: false,
    message: "Employee does not belong to this department",
  });
}


    department.head = employee._id;
    await department.save();

    await department.populate(
      "head",
      "employeeId name email department role"
    );

    return res.status(200).json({
      success: true,
      message: "Department Head assigned successfully",
      department,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    console.error("Assign department head error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign Department Head",
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  assignDepartmentHead,
};