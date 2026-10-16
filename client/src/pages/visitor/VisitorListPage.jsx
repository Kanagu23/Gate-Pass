
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  RefreshCw,
  Search,
  Printer,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";

import { getVisitors } from "../../api/visitor.api";

const STATUS_OPTIONS = [
  { label: "All Visitors", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Checked In", value: "CHECKED_IN" },
  { label: "Checked Out", value: "CHECKED_OUT" },
  { label: "Rejected", value: "REJECTED" },
];

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-blue-50 text-blue-700",
  CHECKED_IN: "bg-green-50 text-green-700",
  CHECKED_OUT: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-50 text-red-700",
};

const VisitorListPage = () => {
  const location = useLocation();

  const basePath = location.pathname.startsWith("/admin")
    ? "/admin"
    : "/gate";

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
      setError(
        err.response?.data?.message ||
          "Unable to load visitors."
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const filteredVisitors = visitors.filter((visitor) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      visitor.name,
      visitor.visitorId,
      visitor.mobile,
      visitor.organization,
      visitor.visitingEmployee?.name,
      visitor.visitingEmployee?.employeeId,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#4169e8]">
            <Users size={19} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Visitor Management
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#10132e]">
            Visitor Directory
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track visitor requests, check-in status, and passes.
          </p>
        </div>

        <Link
          to={`${basePath}/visitors/register`}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#4169e8] px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Register Visitor
        </Link>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search visitor, ID, mobile, employee..."
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#4169e8]"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#4169e8]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadVisitors}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 size={19} className="animate-spin" />
            Loading visitors...
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500">
            <Inbox size={34} className="mb-3" />
            <p className="text-sm">No visitors found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Visitor</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Visiting Employee</th>
                  <th className="px-5 py-4">Purpose</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Registered</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#10132e]">
                        {visitor.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {visitor.visitorId || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>{visitor.mobile}</p>
                      <p className="mt-1 text-xs">
                        {visitor.organization || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>
                        {visitor.visitingEmployee?.name || "—"}
                      </p>
                      <p className="mt-1 text-xs">
                        {visitor.visitingEmployee?.employeeId || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {visitor.visitingPurpose}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLES[visitor.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {visitor.status?.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {visitor.createdAt
                        ? new Date(visitor.createdAt).toLocaleString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {visitor.status === "CHECKED_IN" ? (
                        <Link
                          to={`${basePath}/visitors/${visitor._id}/pass`}
                          className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-[#4169e8] hover:bg-blue-50"
                        >
                          <Printer size={15} />
                          View / Print Pass
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No pass available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredVisitors.length} of {visitors.length} loaded visitors
        </div>
      </div>
    </div>
  );
};

export default VisitorListPage;
