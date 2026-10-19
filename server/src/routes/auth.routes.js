
const express = require("express");
const router = express.Router();

const {
  login,
  logout,
  me,
  createUser,
  getUsers,
  updateUserStatus,
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
  allowRoles("ADMIN"),
  createUser
);
router.get(
  "/users",
  authenticate,
  allowRoles("ADMIN"),
  getUsers
);
router.patch(
  "/users/:userId/status",
  authenticate,
  allowRoles("ADMIN"),
  updateUserStatus
);
module.exports = router;
