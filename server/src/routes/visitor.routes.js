const express = require("express");
const {
  authenticate,
  allowRoles,
} = require("../middleware/auth.middleware");
const {
  registerVisitor,
  getPendingVisitors,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  verifyVisitorPass,
  checkOutByQR,
  getVisitorPass,
  getVisitors
} = require("../controllers/visitor.controller");

const router = express.Router();

// Register a new visitor
// Only Admin and Gate Employee can access this API.
router.post(
  "/",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  registerVisitor
);

router.get(
  "/pending",
  authenticate,
  allowRoles("EMPLOYEE", "DIRECTOR"),
  getPendingVisitors
);

router.patch(
  "/:id/approve",
  authenticate,
  allowRoles("EMPLOYEE", "DIRECTOR"),
  approveVisitor
);

router.patch(
  "/:id/reject",
  authenticate,
  allowRoles("EMPLOYEE", "DIRECTOR"),
  rejectVisitor
);

router.patch(
  "/:id/check-in",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  checkInVisitor
);
router.patch(
  "/:id/check-out",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  checkOutVisitor
);
router.post(
  "/verify-pass",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  verifyVisitorPass
);
router.patch(
  "/check-out/qr",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  checkOutByQR
);
router.get(
  "/:id/pass",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  getVisitorPass
);

router.get(
  "/",
  authenticate,
  allowRoles("ADMIN", "GATE_EMPLOYEE"),
  getVisitors
);

module.exports = router;