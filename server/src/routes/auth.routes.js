
const express = require("express");
const router = express.Router();

const {
  login,
  logout,
  me,
  createUser,
  getUsers,
  updateUserStatus,
  updateUserPermissions,
} = require("../controllers/auth.controller");

const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

// Only an authenticated admin can create internal accounts.
router.post(
  "/users",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  createUser
);
router.get(
  "/users",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  getUsers
);
router.patch(
  "/users/:userId/status",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  updateUserStatus
);
router.patch(
  "/users/:userId/permissions",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  updateUserPermissions
);
module.exports = router;
