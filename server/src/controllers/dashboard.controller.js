const Visitor = require("../models/Visitor");

const { buildDashboardFilter } = require("../utils/dashboardFilters");

const STATUSES = [
  "PENDING",
  "APPROVED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "REJECTED",
];

const handleDashboardError = (error, res) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Dashboard error:", error);

  return res.status(500).json({
    success: false,
    message: "Unable to load dashboard information.",
  });
};

const getDashboardStats = async (req, res) => {
  try {
    const { match } = await buildDashboardFilter(req.user, req.query);

    const [
      totalVisitors,
      currentlyInside,
      pendingApprovals,
      checkedOut,
      rejected,
    ] = await Promise.all([
      Visitor.countDocuments(match),
      Visitor.countDocuments({
        ...match,
        status: "CHECKED_IN",
      }),
      Visitor.countDocuments({
        ...match,
        status: "PENDING",
      }),
      Visitor.countDocuments({
        ...match,
        status: "CHECKED_OUT",
      }),
      Visitor.countDocuments({
        ...match,
        status: "REJECTED",
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalVisitors,
        currentlyInside,
        pendingApprovals,
        checkedOut,
        rejected,
      },
    });
  } catch (error) {
    return handleDashboardError(error, res);
  }
};

const getDashboardAnalytics = async (req, res) => {
  try {
    const { match, start, end } = await buildDashboardFilter(
      req.user,
      req.query,
    );
    const [
      activity,
      statusCounts,
      purposeCounts,
      divisionCounts,
      departmentCounts,
    ] = await Promise.all([
      Visitor.aggregate([
        { $match: match },
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
        { $match: match },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Visitor.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$visitingPurpose",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Visitor.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$visitingDivision",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]),

      Visitor.aggregate([
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "visitingEmployee",
            foreignField: "_id",
            as: "employee",
          },
        },

        {
          $unwind: {
            path: "$employee",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: {
              $ifNull: ["$employee.department", "UNASSIGNED"],
            },
            count: { $sum: 1 },
          },
        },

        { $sort: { count: -1, _id: 1 } },
      ]),
    ]);

    const activityMap = new Map(
      activity.map((item) => [item._id, item.visitors]),
    );

    const dailyActivity = [];

    for (
      let date = new Date(start);
      date < end;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const day = date.toISOString().slice(0, 10);

      dailyActivity.push({
        date: day,
        visitors: activityMap.get(day) || 0,
      });
    }

    const statusMap = new Map(
      statusCounts.map((item) => [item._id, item.count]),
    );

    const statusDistribution = STATUSES.map((status) => ({
      status,
      count: statusMap.get(status) || 0,
    }));

    return res.json({
      success: true,
      analytics: {
        dailyActivity,
        statusDistribution,
        divisionDistribution: divisionCounts.map((item) => ({
          division: item._id || "UNASSIGNED",
          count: item.count,
        })),
        departmentDistribution: departmentCounts.map((item) => ({
          department: item._id || "UNASSIGNED",
          count: item.count,
        })),
        purposeDistribution: purposeCounts.map((item) => ({
          purpose: item._id || "Other",
          count: item.count,
        })),
      },
    });
  } catch (error) {
    return handleDashboardError(error, res);
  }
};

const getRecentVisitors = async (req, res) => {
  try {
    const { match } = await buildDashboardFilter(req.user, req.query);

    const visitors = await Visitor.find(match)
      .select(
  "visitorId name visitingPurpose visitingEmployee status createdAt inTime outTime"
)
      .populate("visitingEmployee", "name employeeId department")
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .lean();

    return res.json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    return handleDashboardError(error, res);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardAnalytics,
  getRecentVisitors,
};
