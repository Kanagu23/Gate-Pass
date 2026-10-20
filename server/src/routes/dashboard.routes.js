
const express = require("express");

const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");

const {
  getDashboardStats,
  getDashboardAnalytics,
  getRecentVisitors,
} = require("../controllers/dashboard.controller");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/stats",
  authenticate,
  allowRoles(
  "SYSTEM_ADMIN",
  "ADMIN",
  "DIVISION_HR",
  "GATE_EMPLOYEE"
),
  getDashboardStats
);

// Admin dashboard analytics
router.get(
  "/analytics",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  getDashboardAnalytics
);
router.get(
  "/recent-visitors",
  authenticate,
  allowRoles(
  "SYSTEM_ADMIN",
  "ADMIN",
  "DIVISION_HR",
  "GATE_EMPLOYEE"
),
  getRecentVisitors
);

module.exports = router;
