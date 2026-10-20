
const User = require("../models/Users");

const SEARCH_ROLES = {
  VISITING_EMPLOYEE: ["EMPLOYEE", "DIRECTOR"],
  DEPARTMENT_HEAD: ["EMPLOYEE", "DIRECTOR"],
  GATE_EMPLOYEE: ["GATE_EMPLOYEE"],
  ALL: [
    "ADMIN",
    "GATE_EMPLOYEE",
    "EMPLOYEE",
    "DIRECTOR",
  ],
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Existing API: Search employee by exact employee ID
// GET /api/employees/search/:employeeId
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
    console.error("Search employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to find employee",
    });
  }
};

// New API: Search employees with filters
// GET /api/employees/search?q=&department=&role=
const searchEmployees = async (req, res) => {
  try {
    const {
      q = "",
      department = "",
      role = "VISITING_EMPLOYEE",
      division = "",
    } = req.query;

    if (
      typeof q !== "string" ||
      typeof department !== "string" ||
      typeof role !== "string" ||
      typeof division !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid search parameters",
      });
    }

    const search = q.trim();
    const departmentValue = department.trim();
    const searchRole = role.trim().toUpperCase();
    const { isDivision } = require("../config/divisions");
    if (division && !isDivision(division)) return res.status(400).json({ success: false, message: "Invalid division" });

    if (
      search.length > 100 ||
      departmentValue.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Search parameters are too long",
      });
    }

    if (!Object.hasOwn(SEARCH_ROLES, searchRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid search role",
      });
    }

    // Only Admin can search Gate Employees
    // or all internal accounts.
    if (
      ["ALL", "GATE_EMPLOYEE"].includes(searchRole) &&
      !["ADMIN", "SYSTEM_ADMIN"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    // Prevent unfiltered directory searches.
    if (!search && !departmentValue) {
      return res.status(200).json({
        success: true,
        employees: [],
      });
    }

    const filter = {
      role: { $in: SEARCH_ROLES[searchRole] },
      isActive: true,
    };

    if (division) filter.division = division;
    else if (searchRole !== "VISITING_EMPLOYEE" && searchRole !== "DEPARTMENT_HEAD" && req.user.division) filter.division = req.user.division;
    // Search by name, email, employee ID,
    // or department.
    if (search) {
      const pattern = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        { name: pattern },
        { email: pattern },
        { employeeId: pattern },
        { department: pattern },
      ];
    }

    // Optional exact department filter.
    // Uses existing string-based department codes.
    if (departmentValue) {
      filter.department = {
        $regex: `^${escapeRegex(departmentValue)}$`,
        $options: "i",
      };
    }

    const employees = await User.find(filter)
      .select(
        "_id employeeId name email phone department division role"
      )
      .sort({ name: 1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      employees: employees.map((employee) => ({
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        division: employee.division,
        role: employee.role,
      })),
    });
  } catch (error) {
    console.error("Search employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search employees",
    });
  }
};

module.exports = {
  searchEmployee,
  searchEmployees,
};
