const Division = require("../models/Division");
const { DIVISIONS } = require("../config/divisions");

const listDivisions = async (req, res) => {
  const items = await Division.find({ isActive: true }).select("code name").sort({ code: 1 }).lean();
  const divisions = items.length ? items : DIVISIONS;
  return res.json({ success: true, divisions: req.user.role === "SYSTEM_ADMIN" || (req.user.role === "ADMIN" && !req.user.division) ? divisions : divisions.filter((d) => d.code === req.user.division) });
};
module.exports = { listDivisions };
