
const Visitor = require("../models/Visitor");

const getDashboardStats = async (req, res) => {
  const [
    totalVisitors,
    currentlyInside,
    pendingApprovals,
    checkedOut,
    rejected,
  ] = await Promise.all([
    Visitor.countDocuments(),
    Visitor.countDocuments({ status: "CHECKED_IN" }),
    Visitor.countDocuments({ status: "PENDING" }),
    Visitor.countDocuments({ status: "CHECKED_OUT" }),
    Visitor.countDocuments({ status: "REJECTED" }),
  ]);

  return res.status(200).json({
    success: true,
    stats: {
      totalVisitors,
      currentlyInside,
      pendingApprovals,
      checkedOut,
      rejected,
    },
  });
};

const getDashboardAnalytics = async (req, res) => {
  // UTC calendar days, including today.
  const today = new Date();
  const startDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - 6
    )
  );

  const [activity, statusCounts] = await Promise.all([
    Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          visitors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Visitor.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const activityMap = new Map(
    activity.map((item) => [item._id, item.visitors])
  );

  const dailyActivity = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);

      const day = date.toISOString().slice(0, 10);

      return {
        date: day,
        visitors: activityMap.get(day) ?? 0,
      };
    }
  );

  const statusMap = new Map(
    statusCounts.map((item) => [item._id, item.count])
  );

  const statuses = [
    "PENDING",
    "APPROVED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "REJECTED",
  ];

  const statusDistribution = statuses.map((status) => ({
    status,
    count: statusMap.get(status) ?? 0,
  }));

  return res.status(200).json({
    success: true,
    analytics: {
      dailyActivity,
      statusDistribution,
    },
  });

};

const getRecentVisitors = async (req, res) => {
  const visitors = await Visitor.find()
    .select(
      "visitorId name visitingPurpose visitingEmployee status createdAt"
    )
    .populate(
      "visitingEmployee",
      "name employeeId department"
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(10)
    .lean();

  return res.status(200).json({
    success: true,
    count: visitors.length,
    visitors,
  });
};


module.exports = {
  getDashboardStats,
  getDashboardAnalytics,
  getRecentVisitors
};
