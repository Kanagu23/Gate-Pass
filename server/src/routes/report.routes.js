const express = require("express");
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const { getDateReport } = require("../controllers/report.controller");
const router = express.Router();
router.get("/visitors", authenticate, allowRoles("SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"), getDateReport);
module.exports = router;
