import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Printer, RefreshCw, Search, UserPlus, Users, X } from "lucide-react";

import { getVisitors } from "../../api/visitor.api";
import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { TableSkeleton } from "../../components/common/Skeleton";
import { buttonStyles } from "../../components/common/buttonStyles";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Checked in", value: "CHECKED_IN" },
  { label: "Checked out", value: "CHECKED_OUT" },
  { label: "Rejected", value: "REJECTED" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const VisitorListPage = () => {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "/gate";

  const [visitors, setVisitors] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVisitors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getVisitors(status);
      setVisitors(response.visitors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load visitors.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visitors;

    return visitors.filter((visitor) =>
      [
        visitor.name,
        visitor.visitorId,
        visitor.mobile,
        visitor.organization,
        visitor.visitingEmployee?.name,
        visitor.visitingEmployee?.employeeId,
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [visitors, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        title="Visitors"
        description="Track visitor requests, check-in status and passes."
        actions={
          <Link
            to={`${basePath}/visitors/register`}
            className={buttonStyles("primary", "md")}
          >
            <UserPlus size={14} />
            Register visitor
          </Link>
        }
      />

      <div className="rise rounded-card border border-line bg-white shadow-card" style={{ "--i": 1 }}>
        {/* Toolbar */}
        <div className="flex flex-col gap-2.5 border-b border-line p-3 lg:flex-row lg:items-center">
          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex gap-0.5 overflow-x-auto rounded-control bg-slate-100 p-0.5"
          >
            {STATUS_TABS.map((tab) => {
              const active = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatus(tab.value)}
                  className={`h-7 whitespace-nowrap rounded-[5px] px-2.5 text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-white text-ink shadow-[0_1px_2px_rgba(16,19,46,0.1)]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 lg:max-w-xs lg:ml-auto">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, mobile, employee..."
              aria-label="Search visitors"
              className="field pl-8 pr-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={loadVisitors}
            disabled={loading}
            aria-label="Refresh visitors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-3">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {loading && visitors.length === 0 ? (
          <TableSkeleton rows={6} />
        ) : filteredVisitors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No visitors found"
            description={
              search
                ? "Try a different search term or clear the filters."
                : "Visitors you register will appear here."
            }
          />
        ) : (
          <div
            className={`overflow-x-auto transition-opacity duration-150 ${
              loading ? "opacity-60" : ""
            }`}
          >
            <table className="tbl min-w-[860px]">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Contact</th>
                  <th>Visiting</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="text-right">Pass</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={visitor.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {visitor.name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            {visitor.visitorId || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-slate-600">
                      <p>{visitor.mobile}</p>
                      <p className="text-xs text-slate-400">
                        {visitor.organization || "—"}
                      </p>
                    </td>

                    <td className="text-slate-600">
                      <p>{visitor.visitingEmployee?.name || "—"}</p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {visitor.visitingEmployee?.employeeId || "—"}
                      </p>
                    </td>

                    <td className="text-slate-600">{visitor.visitingPurpose}</td>

                    <td>
                      <StatusBadge status={visitor.status} />
                    </td>

                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {formatDate(visitor.createdAt)}
                    </td>

                    <td className="text-right">
                      {visitor.status === "CHECKED_IN" ? (
                        <Link
                          to={`${basePath}/visitors/${visitor._id}/pass`}
                          className={buttonStyles("soft", "sm")}
                        >
                          <Printer size={12} />
                          View pass
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-line px-4 py-2 text-xs text-slate-400">
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </div>
      </div>
    </div>
  );
};

export default VisitorListPage;
