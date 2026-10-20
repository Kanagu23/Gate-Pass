
const User = require("../models/Users");
const Department = require("../models/Departments");
const { isDivision } = require("../config/divisions");

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const forbidden = (message) => {
  const error = new Error(message);
  error.status = 403;
  return error;
};

const parseDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw badRequest("Invalid date format. Use YYYY-MM-DD.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw badRequest("Invalid calendar date.");
  }

  return date;
};



const getDateBounds = (query) => {
  const range = query.dateRange || "7days";

  const today = new Date();

  const end = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1
    )
  );

  let start;

  if (range === "custom") {
    if (!query.startDate || !query.endDate) {
      throw badRequest(
        "Start date and end date are required."
      );
    }

    start = parseDate(query.startDate);

    const lastDay = parseDate(query.endDate);

    end.setTime(lastDay.getTime());
    end.setUTCDate(end.getUTCDate() + 1);
  } else {
    const daysByRange = {
      today: 1,
      "7days": 7,
      "30days": 30,
    };

    if (!daysByRange[range]) {
      throw badRequest(
        "Invalid dashboard date range."
      );
    }

    start = new Date(end);
    start.setUTCDate(
      start.getUTCDate() - daysByRange[range]
    );
  }

  // Validate after both dates are calculated.
  if (start >= end) {
    throw badRequest(
      "Start date must not exceed end date."
    );
  }

  const maximumDays = 366;

  const selectedDays =
    (end.getTime() - start.getTime()) / 86400000;

  if (selectedDays > maximumDays) {
    throw badRequest(
      "Select a date range of 366 days or less."
    );
  }

  return { start, end };
};


const buildDashboardFilter = async (user, query = {}) => {
  const isSystemAdmin = user.role === "SYSTEM_ADMIN";

  const requestedDivision = query.division || "";

  if (
    typeof requestedDivision !== "string" ||
    (requestedDivision && !isDivision(requestedDivision))
  ) {
    throw badRequest("Invalid division.");
  }

  if (!isSystemAdmin && !user.division) {
    throw forbidden("Your account has no assigned division.");
  }

  // Never trust a division supplied by a non-system admin.
  if (
    !isSystemAdmin &&
    requestedDivision &&
    requestedDivision !== user.division
  ) {
    throw forbidden("Division access denied.");
  }

  const division = isSystemAdmin
    ? requestedDivision
    : user.division;

  const { start, end } = getDateBounds(query);

  const match = {
    createdAt: {
      $gte: start,
      $lt: end,
    },
  };

  if (division) {
    match.visitingDivision = division;
  }

  const departmentCode = query.department || "";

  if (typeof departmentCode !== "string") {
    throw badRequest("Invalid department.");
  }

  if (departmentCode) {
    const department = await Department.findOne({
      code: departmentCode.trim().toUpperCase(),
      ...(division ? { division } : {}),
      isActive: true,
    }).lean();

    if (!department) {
      throw badRequest(
        "Department not found in the selected division."
      );
    }

    const employees = await User.find({
      division: department.division,
      department: {
        $in: [
          new RegExp(
            `^${department.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
          new RegExp(
            `^${department.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        ],
      },
    })
      .select("_id")
      .lean();

    match.visitingEmployee = {
      $in: employees.map((employee) => employee._id),
    };
  }

  return {
    match,
    start,
    end,
  };
};

module.exports = {
  buildDashboardFilter,
};
