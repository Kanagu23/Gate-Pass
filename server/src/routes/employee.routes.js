
const express = require("express");

const {
  searchEmployee,
  searchEmployees,
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

router.get(
  "/search",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  searchEmployees
);
module.exports = router;
