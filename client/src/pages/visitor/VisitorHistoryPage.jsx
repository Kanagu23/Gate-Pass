
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { getVisitorHistory } from "../../api/visitor.api";

import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { TableSkeleton } from "../../components/common/Skeleton";
import VisitorTimeCell from "../../components/dashboard/VisitorTimeCell";

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

const VisitorHistoryPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVisitorHistory(status);

      setVisitors(response.visitors || []);
    } catch (err) {
      setVisitors([]);
      setError(
        err.response?.data?.message ||
          "Unable to load visitor request history."
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return visitors;

    return visitors.filter((visitor) =>
      [
        visitor.name,
        visitor.visitorId,
        visitor.mobile,
        visitor.organization,
        visitor.visitingPurpose,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [visitors, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        title="Visitor request history"
        description="Review previous visitor requests assigned to you."
        actions={
          <Button
            variant="secondary"
            onClick={loadHistory}
            disabled={loading}
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert tone="error">
          {error}
        </Alert>
      )}

      <div
        className="rise overflow-hidden rounded-card border border-line bg-white shadow-card"
        style={{ "--i": 1 }}
      >
        {/* Filters and search */}
        <div className="flex flex-col gap-3 border-b border-line p-3 lg:flex-row lg:items-center">
          <div
            role="tablist"
            aria-label="Filter visitor requests by status"
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

          <div className="relative flex-1 lg:ml-auto lg:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search visitor name, ID, mobile..."
              aria-label="Search visitor history"
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
        </div>

        {/* History table */}
        {loading && visitors.length === 0 ? (
          <TableSkeleton rows={6} />
        ) : filteredVisitors.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No visitor history found"
            description={
              search
                ? "Try another search term or clear your filters."
                : "Visitor requests assigned to you will appear here."
            }
          />
        ) : (
          <div
            className={`overflow-x-auto transition-opacity duration-150 ${
              loading ? "opacity-60" : ""
            }`}
          >
            <table className="tbl min-w-[820px]">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Contact</th>
                  <th>Purpose</th>
                  <th>Requested by</th>
                  <th>Status</th>
                  <th>Requested at</th>
                  <th>In / Out</th>
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
                      <p>{visitor.mobile || "—"}</p>
                      <p className="text-xs text-slate-400">
                        {visitor.organization || "—"}
                      </p>
                    </td>

                    <td className="text-slate-600">
                      {visitor.visitingPurpose || "—"}
                    </td>

                    <td className="text-slate-600">
                      <p>
                        {visitor.createdBy?.name || "—"}
                      </p>

                      <p className="font-mono text-[11px] text-slate-400">
                        {visitor.createdBy?.employeeId || "—"}
                      </p>
                    </td>

                   
<td>
  <div className="space-y-1.5">
    <StatusBadge status={visitor.status} />

    {visitor.status === "REJECTED" && (
      <div className="max-w-[240px]">
        <p className="text-[11px] leading-4 text-slate-600">
          <span className="font-medium text-red-600">
            Reason:
          </span>{" "}
          {visitor.rejectionReason ||
            "Reason not recorded"}
        </p>

        {visitor.rejectedAt && (
          <p className="mt-1 text-[10px] text-slate-400">
            Rejected: {formatDate(visitor.rejectedAt)}
          </p>
        )}
      </div>
    )}
  </div>
</td>


                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {formatDate(visitor.createdAt)}
                    </td>
<td>
  <VisitorTimeCell
    inTime={visitor.inTime}
    outTime={visitor.outTime}
  />
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-line px-4 py-2 text-xs text-slate-400">
          Showing {filteredVisitors.length} of{" "}
          {visitors.length} requests
        </div>
      </div>
    </div>
  );
};

export default VisitorHistoryPage;
