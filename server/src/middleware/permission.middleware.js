
const {
  PERMISSION_VALUES,
} = require("../constants/permissions");

const hasPermission = (user, permission) => {
  if (!user || !user.isActive) return false;

  // Admin always has full access.
  if (user.role === "ADMIN") return true;

  return (
    Array.isArray(user.permissions) &&
    user.permissions.includes(permission)
  );
};

const allowPermissions = (...requiredPermissions) => {
  // Fail fast if the route is configured incorrectly.
  if (
    requiredPermissions.length === 0 ||
    requiredPermissions.some(
      (permission) => !PERMISSION_VALUES.includes(permission)
    )
  ) {
    throw new Error("Invalid permission middleware configuration");
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const allowed = requiredPermissions.every((permission) =>
      hasPermission(req.user, permission)
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have the required permissions",
      });
    }

    next();
  };
};

// Allow access when the user has an existing role
// OR an explicitly assigned permission.
const allowRoleOrPermission = (roles, permission) => {
  if (
    !Array.isArray(roles) ||
    !PERMISSION_VALUES.includes(permission)
  ) {
    throw new Error("Invalid role or permission configuration");
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      roles.includes(req.user.role) ||
      hasPermission(req.user, permission)
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
    });
  };
};

module.exports = {
  hasPermission,
  allowPermissions,
  allowRoleOrPermission,
};
