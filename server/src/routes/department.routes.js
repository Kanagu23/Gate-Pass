
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
  allowRoles("ADMIN"),
  createDepartment
);

// Admin can view all departments.
// Gate Employees, Employees, and Directors can
// access the department directory.
router.get(
  "/",
  authenticate,
  allowRoles(
    "ADMIN",
    "GATE_EMPLOYEE",
    "EMPLOYEE",
    "DIRECTOR"
  ),
  getDepartments
);
router.patch(
  "/:departmentId/head",
  authenticate,
  allowRoles("ADMIN"),
  assignDepartmentHead
);
module.exports = router;
