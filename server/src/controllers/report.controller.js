const Visitor = require("../models/Visitor");
const { isDivision, DIVISIONS } = require("../config/divisions");

const getDateReport = async (req, res) => {
  const parseDay = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null;
  const from = parseDay(req.query.from);
  const until = parseDay(req.query.to);
  const to = until ? new Date(until.getTime() + 86400000) : null;
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to || to.getTime() - from.getTime() > 366 * 86400000) {
    return res.status(400).json({ success: false, message: "Valid from/to dates within one year are required" });
  }
  const privileged = req.user.role === "SYSTEM_ADMIN" || (req.user.role === "ADMIN" && !req.user.division);
  const requested = req.query.division || "";
  if (requested && !isDivision(requested)) return res.status(400).json({ success: false, message: "Invalid division" });
  if (!privileged && requested && requested !== req.user.division) return res.status(403).json({ success: false, message: "Division access denied" });
  const division = privileged ? requested : req.user.division;
  if (!privileged && !division) return res.status(403).json({ success: false, message: "User has no assigned division" });
  const match = { createdAt: { $gte: from, $lt: to } };
  if (division) match.visitingDivision = division;
  const rows = await Visitor.aggregate([
    { $match: match },
    { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, division: { $ifNull: ["$visitingDivision", "UNASSIGNED"] }, status: "$status" }, count: { $sum: 1 } } },
    { $sort: { "_id.date": 1, "_id.division": 1, "_id.status": 1 } },
  ]);
  const totals = rows.reduce((acc, row) => {
    acc.total += row.count;
    acc.byStatus[row._id.status] = (acc.byStatus[row._id.status] || 0) + row.count;
    acc.byDivision[row._id.division] = (acc.byDivision[row._id.division] || 0) + row.count;
    return acc;
  }, { total: 0, byStatus: {}, byDivision: {} });
  res.json({ success: true, from: req.query.from, to: req.query.to, division: division || "ALL", divisions: DIVISIONS, totals, rows: rows.map((r) => ({ date: r._id.date, division: r._id.division, status: r._id.status, count: r.count })) });
};
module.exports = { getDateReport };
