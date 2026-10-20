
const express = require("express");

const {
  createDepartment,
  getDepartments,
  assignDepartmentHead,
} = require("../controllers/department.controller");

const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Admin can create departments.
router.post(
  "/",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  createDepartment
);

// Admin can view all departments.
// Gate Employees, Employees, and Directors can
// access the department directory.
router.get(
  "/",
  authenticate,
  allowRoles(
    "SYSTEM_ADMIN", "DIVISION_HR", "ADMIN",
    "GATE_EMPLOYEE",
    "EMPLOYEE",
    "DIRECTOR"
  ),
  getDepartments
);
router.patch(
  "/:departmentId/head",
  authenticate,
  allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"),
  assignDepartmentHead
);
module.exports = router;
