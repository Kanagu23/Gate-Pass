const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { listDivisions } = require("../controllers/division.controller");
const router = express.Router();
router.get("/", authenticate, listDivisions);
module.exports = router;
