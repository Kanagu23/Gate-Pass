import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clock3,
  LogOut,
  RefreshCw,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { Skeleton } from "../../components/common/Skeleton";
import useCountUp from "../../hooks/useCountUp";
import {
  getDashboardStats,
  getDashboardAnalytics,
  getRecentVisitors,
} from "../../api/dashboard.api";
import { useAuth } from "../../context/AuthContext";
import { quickActionsFor } from "../../config/navigation";

import VisitorActivityChart from "../../components/dashboard/VisitorActivityChart";
import VisitorStatusChart from "../../components/dashboard/VisitorStatusChart";
import RecentVisitorsTable from "../../components/dashboard/RecentVisitorsTable";

const STAT_ITEMS = [
  {
    key: "totalVisitors",
    label: "Total visitors",
    icon: Users,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    key: "currentlyInside",
    label: "Currently inside",
    icon: UserCheck,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "pendingApprovals",
    label: "Pending approvals",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    key: "checkedOut",
    label: "Checked out",
    icon: LogOut,
    tone: "bg-slate-100 text-slate-500",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: UserX,
    tone: "bg-red-50 text-red-500",
  },
];

const StatCard = ({ label, value, icon: Icon, tone, index }) => {
  const animated = useCountUp(value);

  return (
    <div
      style={{ "--i": index }}
      className="rise group rounded-card border border-line bg-white p-3.5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-line-strong hover:shadow-[0_4px_14px_-6px_rgba(16,19,46,0.12)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${tone}`}
        >
          <Icon size={14} />
        </span>
      </div>

      <p className="mt-2.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {animated.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const StatSkeleton = () => (
  <div className="rounded-card border border-line bg-white p-3.5">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-7" />
    </div>
    <Skeleton className="mt-3 h-6 w-14" />
  </div>
);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const DashboardPage = ({ role }) => {
  const { user } = useAuth();
  const isAdmin = role === "ADMIN";
  const actions = quickActionsFor(role);
  const firstName = (user?.name || user?.employeeName || "").split(" ")[0];

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(isAdmin);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
const [recentVisitors, setRecentVisitors] = useState([]);

const loadStats = useCallback(async () => {
  if (!isAdmin) return;

  try {
   setRefreshing(true);
setError("");
    const [statsResponse, analyticsResponse, recentResponse] =
      await Promise.all([
        getDashboardStats(),
        getDashboardAnalytics(),
        getRecentVisitors(),
      ]);

    setStats(statsResponse.stats);
    setAnalytics(analyticsResponse.analytics);
    setRecentVisitors(recentResponse.visitors || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to load dashboard information."
    );
  } finally {
  setLoading(false);
  setRefreshing(false);
}
}, [isAdmin]);


  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description={
          isAdmin
            ? "Here's what's happening at the gate today."
            : "Pick up where you left off."
        }
        actions={
          isAdmin && (
           <Button
  variant="secondary"
  size="sm"
  onClick={loadStats}
  disabled={loading || refreshing}
>
  <RefreshCw
    size={13}
    className={refreshing ? "animate-spin" : ""}
  />
  {refreshing ? "Refreshing..." : "Refresh"}
</Button>
          )
        }
      />

      {isAdmin && (
        <section aria-label="Visitor statistics" className="space-y-3">
          {error && <Alert tone="error">{error}</Alert>}

          {loading && !stats ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {STAT_ITEMS.map((item) => (
                <StatSkeleton key={item.key} />
              ))}
            </div>
          ) : (
            stats && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {STAT_ITEMS.map((item, index) => (
                  <StatCard
                    key={item.key}
                    index={index}
                    label={item.label}
                    value={stats[item.key]}
                    icon={item.icon}
                    tone={item.tone}
                  />
                ))}
              </div>
            )
          )}
        </section>
      )}

      {actions.length > 0 && (
        <Card title="Quick actions" padded={false}>
          <div
            className={`grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${
              actions.length > 2 ? "lg:grid-cols-3" : ""
            }`}
          >
            {actions.map(({ label, path, icon: Icon, hint }) => (
              <Link
                key={path}
                to={path}
                className="group flex items-center gap-3 p-3.5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand transition-transform duration-150 group-hover:scale-105">
                  <Icon size={15} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-slate-800">
                    {label}
                  </p>
                  <p className="truncate text-xs text-slate-500">{hint}</p>
                </div>

                <ArrowUpRight
                  size={14}
                  className="text-slate-300 transition-all duration-150 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-brand"
                />
              </Link>
            ))}
          </div>
        </Card>
      )}
      
{isAdmin && analytics && (
<section
  aria-label="Visitor analytics"
  className="grid grid-cols-1 gap-3 lg:grid-cols-2"
>
  <VisitorActivityChart
    data={analytics.dailyActivity || []}
  />

  <VisitorStatusChart
    data={analytics.statusDistribution || []}
  />
</section>
)}

{isAdmin && (
  <section aria-label="Recent visitors">
    <RecentVisitorsTable visitors={recentVisitors} />
  </section>
)}

    </div>
  );
};

export default DashboardPage;
