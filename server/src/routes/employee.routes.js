
const express = require("express");

const {
  searchEmployee,
  searchEmployees,
} = require("../controllers/employee.controller");
const {
  allowRoleOrPermission,
} = require("../middleware/permission.middleware");

const {
  PERMISSIONS,
} = require("../constants/permissions");

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
  allowRoleOrPermission(
    ["SYSTEM_ADMIN", "ADMIN", "GATE_EMPLOYEE"],
    PERMISSIONS.VISITOR_REGISTER
  ),
  searchEmployees
);

module.exports = router;
