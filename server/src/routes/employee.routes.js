
const express = require("express");

const {
  searchEmployee,
} = require("../controllers/employee.controller");

const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/search/:employeeId",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  searchEmployee
);

module.exports = router;
