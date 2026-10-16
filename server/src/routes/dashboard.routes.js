
const express = require("express");

const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");

const {
  getDashboardStats,
  getDashboardAnalytics,
} = require("../controllers/dashboard.controller");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/stats",
  authenticate,
  allowRoles("ADMIN"),
  getDashboardStats
);

// Admin dashboard analytics
router.get(
  "/analytics",
  authenticate,
  allowRoles("ADMIN"),
  getDashboardAnalytics
);

module.exports = router;
