const Visitor = require("../models/Visitor");

const getScope = (user) => {
  if (user.role === "SYSTEM_ADMIN") return {};
  if (!user.division) return null;
  return { visitingDivision: user.division };
};
const accessError = (res) => res.status(403).json({ success: false, message: "Assign your account to a division before viewing reports." });
const getDashboardStats = async (req, res) => {
  const scope = getScope(req.user);
  if (!scope) return accessError(res);
  const [totalVisitors, currentlyInside, pendingApprovals, checkedOut, rejected] = await Promise.all([
    Visitor.countDocuments(scope),
    Visitor.countDocuments({ ...scope, status: "CHECKED_IN" }),
    Visitor.countDocuments({ ...scope, status: "PENDING" }),
    Visitor.countDocuments({ ...scope, status: "CHECKED_OUT" }),
    Visitor.countDocuments({ ...scope, status: "REJECTED" }),
  ]);
  return res.json({ success: true, stats: { totalVisitors, currentlyInside, pendingApprovals, checkedOut, rejected } });
};
const getDashboardAnalytics = async (req, res) => {
  const scope = getScope(req.user);
  if (!scope) return accessError(res);
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-6));
  const [activity,statusCounts] = await Promise.all([
    Visitor.aggregate([
      { $match: { ...scope, createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, visitors: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Visitor.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const byDay = new Map(activity.map((x) => [x._id,x.visitors]));
  const dailyActivity = Array.from({ length: 7 }, (_,i) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate()+i);
    const day = date.toISOString().slice(0,10);
    return { date: day, visitors: byDay.get(day) || 0 };
  });
  const byStatus = new Map(statusCounts.map((x) => [x._id,x.count]));
  const statusDistribution = ["PENDING","APPROVED","CHECKED_IN","CHECKED_OUT","REJECTED"].map((status) => ({ status, count: byStatus.get(status) || 0 }));
  return res.json({ success: true, analytics: { dailyActivity, statusDistribution } });
};
const getRecentVisitors = async (req, res) => {
  const scope = getScope(req.user);
  if (!scope) return accessError(res);
  const visitors = await Visitor.find(scope)
    .select("visitorId name visitingPurpose visitingEmployee status createdAt")
    .populate("visitingEmployee", "name employeeId department")
    .sort({ createdAt: -1, _id: -1 }).limit(10).lean();
  return res.json({ success: true, count: visitors.length, visitors });
};
module.exports = { getDashboardStats, getDashboardAnalytics, getRecentVisitors };
