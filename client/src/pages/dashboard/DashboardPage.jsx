
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserCheck,
  Clock3,
  LogOut,
  UserX,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import Card from "../../components/common/Card";
import {
  getDashboardStats,
  getDashboardAnalytics,
} from "../../api/dashboard.api";

import VisitorActivityChart from "../../components/dashboard/VisitorActivityChart";
import VisitorStatusChart from "../../components/dashboard/VisitorStatusChart";

const roleLabels = {
  ADMIN: "Administrator",
  GATE_EMPLOYEE: "Gate Employee",
  EMPLOYEE: "Employee",
  DIRECTOR: "Director",
};

const STAT_ITEMS = [
  {
    key: "totalVisitors",
    label: "Total Visitors",
    icon: Users,
    iconStyle: "bg-blue-50 text-blue-600",
  },
  {
    key: "currentlyInside",
    label: "Currently Inside",
    icon: UserCheck,
    iconStyle: "bg-green-50 text-green-600",
  },
  {
    key: "pendingApprovals",
    label: "Pending Approvals",
    icon: Clock3,
    iconStyle: "bg-amber-50 text-amber-600",
  },
  {
    key: "checkedOut",
    label: "Checked Out",
    icon: LogOut,
    iconStyle: "bg-slate-100 text-slate-600",
  },
  {
    key: "rejected",
    label: "Rejected Requests",
    icon: UserX,
    iconStyle: "bg-red-50 text-red-600",
  },
];

const StatCard = ({ label, value, icon: Icon, iconStyle }) => (
  <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${iconStyle}`}
      >
        <Icon size={19} />
      </div>
    </div>

    <p className="mt-4 text-3xl font-semibold tracking-tight text-[#10132e]">
      {Number(value ?? 0).toLocaleString("en-IN")}
    </p>
  </div>
);

const DashboardPage = ({ role }) => {
  const roleLabel = roleLabels[role] || "User";
  const isAdmin = role === "ADMIN";


const [stats, setStats] = useState(null);
const [analytics, setAnalytics] = useState(null);
const [loading, setLoading] = useState(isAdmin);
const [error, setError] = useState("");



const loadStats = useCallback(async () => {
  if (!isAdmin) return;

  setLoading(true);
  setError("");

  try {
    const results = await Promise.allSettled([
      getDashboardStats(),
      getDashboardAnalytics(),
    ]);

    const [statsResult, analyticsResult] = results;

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value.stats);
    }

    if (analyticsResult.status === "fulfilled") {
      setAnalytics(analyticsResult.value.analytics);
    }

    if (
      statsResult.status === "rejected" ||
      analyticsResult.status === "rejected"
    ) {
      setError(
        "Some dashboard data could not be refreshed. Please try again."
      );
    }
  } catch (err) {
    setError("Unable to refresh dashboard.");
  } finally {
    setLoading(false);
  }
}, [isAdmin]);


  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-[#4169e8]">
            <LayoutDashboard size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#10132e]">
              {roleLabel} Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isAdmin
                ? "Monitor visitor activity and access status."
                : "Your Gate Pass workspace."}
            </p>
          </div>
        </div>

        {isAdmin && (
        <button
  type="button"
  onClick={loadStats}
  disabled={loading}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
>
  <RefreshCw
    size={16}
    className={loading ? "animate-spin" : ""}
  />
  {loading ? "Refreshing..." : "Refresh"}
</button>
        )}
      </section>

      {isAdmin ? (
        <>
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

       
{loading && !stats ? (
  <div className="flex items-center justify-center gap-3 rounded-md border border-slate-200 bg-white p-12 text-sm text-slate-500">
    <Loader2 size={19} className="animate-spin" />
    Loading dashboard statistics...
  </div>
) : stats ? (
  <>
    {/* Existing statistics cards */}
    <section>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#10132e]">
          Visitor Overview
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Current statistics from MongoDB
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_ITEMS.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={stats[item.key]}
            icon={item.icon}
            iconStyle={item.iconStyle}
          />
        ))}
      </div>
    </section>

    {/* Analytics charts */}
    {analytics && (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#10132e]">
            Visitor Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Registration trends and visitor status distribution
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <VisitorActivityChart
            data={analytics.dailyActivity}
          />

          <VisitorStatusChart
            data={analytics.statusDistribution}
          />
        </div>
      </section>
    )}
  </>
) : null}

        </>
      ) : (
        <Card
          title="Welcome to Gate Pass"
          description="Your workspace is ready."
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#4169e8]"
            />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Signed in as {roleLabel}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use the sidebar to access your visitor management
                features.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
