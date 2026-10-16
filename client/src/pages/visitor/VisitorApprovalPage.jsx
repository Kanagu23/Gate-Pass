
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ClipboardCheck,
  AlertCircle,
  Loader2,
  Inbox,
} from "lucide-react";

import {
  getPendingVisitors,
  approveVisitor,
  rejectVisitor,
} from "../../api/approval.api";

const VisitorApprovalPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadVisitors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingVisitors();
      setVisitors(response.visitors || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load pending visitors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const handleDecision = async (visitor, action) => {
    const isApprove = action === "approve";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        isApprove ? "approve" : "reject"
      } ${visitor.name}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(visitor._id);
      setError("");
      setMessage("");

      const response = isApprove
        ? await approveVisitor(visitor._id)
        : await rejectVisitor(visitor._id);

      setMessage(
        response.message ||
          `Visitor ${isApprove ? "approved" : "rejected"} successfully.`
      );

      await loadVisitors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process visitor request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#4169e8]">
            <ClipboardCheck size={19} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Visitor Management
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#10132e]">
            Pending Approvals
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review visitor requests assigned to you.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVisitors}
          disabled={loading || Boolean(processingId)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-[#10132e]">
            Visitor Requests
          </h2>

          <span className="text-xs font-medium text-slate-500">
            {visitors.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading visitor requests...
          </div>
        ) : visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Inbox size={34} className="mb-4 text-slate-400" />

            <h3 className="font-semibold text-slate-800">
              No pending approvals
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              New visitor requests assigned to you will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Visitor</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Purpose</th>
                  <th className="px-5 py-4 font-semibold">Requested</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#10132e]">
                        {visitor.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {visitor.visitorId}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {visitor.organization || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>{visitor.mobile}</p>
                      <p className="mt-1 text-xs">
                        {visitor.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {visitor.visitingPurpose}
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

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-sm bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {visitor.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecision(visitor, "approve")}
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === visitor._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDecision(visitor, "reject")}
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorApprovalPage;
