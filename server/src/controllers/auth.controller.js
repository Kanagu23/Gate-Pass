
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const mongoose = require("mongoose");
const generateEmployeeId = require("../utils/generateEmployeeId");
const {
  PERMISSION_VALUES,
} = require("../constants/permissions");

const roles = ["ADMIN", "GATE_EMPLOYEE", "EMPLOYEE", "DIRECTOR"];


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

function publicUser(user) {
  return {
    id: user._id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    role: user.role,
    isActive: user.isActive,
  };
}


async function login(req, res) {
  const { identifier, password } = req.body;

  if (
    typeof identifier !== "string" ||
    !identifier.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email or Employee ID and password are required",
    });
  }

  const value = identifier.trim();
  const isEmail = value.includes("@");

  const query = isEmail
    ? { email: value.toLowerCase() }
    : { employeeId: value.toUpperCase() };

  const user = await User.findOne(query).select("+passwordHash");

  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid login credentials",
    });
  }

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.cookie("accessToken", token, cookieOptions);

  return res.json({
    success: true,
    user: publicUser(user),
  });
}

function logout(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}

function me(req, res) {
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
}

async function createUser(req, res) {
  const { name, email, password, role, phone, department } =
    req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 72 ||
    !roles.includes(role)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a name, valid email, password (12–72 characters), and valid role",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

const isEmployeeRole = [
  "GATE_EMPLOYEE",
  "EMPLOYEE",
  "DIRECTOR",
].includes(role);

const employeeId = isEmployeeRole
  ? await generateEmployeeId()
  : undefined;

const passwordHash = await bcrypt.hash(password, 12);

try {
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    employeeId,
    phone: typeof phone === "string" ? phone.trim() : "",
    department:
      typeof department === "string" ? department.trim() : "",
  });

  return res.status(201).json({
    success: true,
    user: publicUser(user),
  });
} catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email or employee ID already exists. Please retry.",
    });
  }

  throw error;
}
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "_id employeeId name email phone department role isActive permissions createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin accounts cannot be deactivated through this endpoint.
    if (targetUser.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin account status cannot be changed",
      });
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        _id: targetUser._id,
        employeeId: targetUser.employeeId,
        name: targetUser.name,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status",
    });
  }
};

const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (
      !Array.isArray(permissions) ||
      permissions.some(
        (permission) =>
          typeof permission !== "string" ||
          !PERMISSION_VALUES.includes(permission)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid permissions",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin permissions cannot be modified.
    if (user.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin permissions cannot be modified",
      });
    }

    // Remove duplicate permissions.
    user.permissions = [...new Set(permissions)];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      user: {
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error("Update permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user permissions",
    });
  }
};


module.exports = {
  login,
  logout,
  me,
  createUser,
  getUsers,
  updateUserStatus,
  updateUserPermissions
};
