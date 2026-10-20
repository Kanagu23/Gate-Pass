import { useCallback, useEffect, useState } from "react";
import { Check, ClipboardCheck, RefreshCw, X } from "lucide-react";

import {
  approveVisitor,
  getPendingVisitors,
  rejectVisitor,
} from "../../api/approval.api";
import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { TableSkeleton } from "../../components/common/Skeleton";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const VisitorApprovalPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [pending, setPending] = useState(null); // { visitor, action }
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const loadVisitors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getPendingVisitors();
      setVisitors(response.visitors || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load pending visitors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);


const confirmDecision = async () => {
  if (!pending) return;

  const { visitor, action } = pending;
  const isApprove = action === "approve";

  const reason = rejectionReason.trim();

  if (!isApprove && !reason) {
    setError("Rejection reason is required");
    return;
  }

  if (!isApprove && reason.length > 500) {
    setError("Rejection reason cannot exceed 500 characters");
    return;
  }

  try {
    setProcessingId(visitor._id);
    setError("");
    setMessage("");

    const response = isApprove
      ? await approveVisitor(visitor._id)
      : await rejectVisitor(visitor._id, reason);

    setMessage(
      response.message ||
        `Visitor ${isApprove ? "approved" : "rejected"} successfully.`
    );

    setPending(null);
    setRejectionReason("");

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
const closeDecision = () => {
  if (processingId) return;

  setPending(null);
  setRejectionReason("");
  setError("");
};

  const isApprove = pending?.action === "approve";

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader
        title="Pending approvals"
        description="Review visitor requests assigned to you."
        actions={
          <Button
            variant="secondary"
            onClick={loadVisitors}
            disabled={loading || Boolean(processingId)}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      {message && (
        <Alert tone="success" onDismiss={() => setMessage("")}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert tone="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      <div
        className="rise overflow-hidden rounded-card border border-line bg-white shadow-card"
        style={{ "--i": 1 }}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-ink">
            Visitor requests
          </h2>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            {visitors.length} pending
          </span>
        </div>

        {loading && visitors.length === 0 ? (
          <TableSkeleton rows={4} />
        ) : visitors.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="You're all caught up"
            description="New visitor requests assigned to you will appear here."
          />
        ) : (
          <div
            className={`overflow-x-auto transition-opacity duration-150 ${
              loading ? "opacity-60" : ""
            }`}
          >
            <table className="tbl min-w-[780px]">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Contact</th>
                  <th>Purpose</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th className="text-right">Decision</th>
                </tr>
              </thead>

              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={visitor.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {visitor.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            <span className="font-mono">{visitor.visitorId}</span>
                            {visitor.organization && ` · ${visitor.organization}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-slate-600">
                      <p>{visitor.mobile}</p>
                      <p className="text-xs text-slate-400">
                        {visitor.email || "—"}
                      </p>
                    </td>

                    <td className="text-slate-600">{visitor.visitingPurpose}</td>

                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {formatDate(visitor.createdAt)}
                    </td>

                    <td>
                      <StatusBadge status={visitor.status} />
                    </td>

                    <td>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={Boolean(processingId)}
                          onClick={() => setPending({ visitor, action: "approve" })}
                        >
                          <Check size={12} strokeWidth={2.5} />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="danger-outline"
                          disabled={Boolean(processingId)}
                          onClick={() => setPending({ visitor, action: "reject" })}
                        >
                          <X size={12} strokeWidth={2.5} />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

     
{/* Approval confirmation */}
<ConfirmDialog
  open={Boolean(pending) && isApprove}
  title="Approve visitor?"
  message={
    pending
      ? `${pending.visitor.name} (${pending.visitor.visitorId}) will be approved.`
      : ""
  }
  confirmLabel="Approve"
  confirmVariant="success"
  loading={Boolean(processingId)}
  onConfirm={confirmDecision}
  onCancel={closeDecision}
/>

{/* Rejection modal */}
<Modal
  open={Boolean(pending) && !isApprove}
  title="Reject visitor?"
  description={
    pending
      ? `${pending.visitor.name} (${pending.visitor.visitorId}) will be rejected.`
      : ""
  }
  size="sm"
  closeDisabled={Boolean(processingId)}
  onClose={closeDecision}
>
  <div className="space-y-4">
    <div>
      <Textarea
        id="rejectionReason"
        label="Rejection reason *"
        value={rejectionReason}
        onChange={(event) =>
          setRejectionReason(event.target.value)
        }
        placeholder="Enter the reason for rejecting this visitor..."
        rows={4}
        maxLength={500}
        required
        disabled={Boolean(processingId)}
      />

      <p className="mt-1 text-right text-[11px] text-slate-400">
        {rejectionReason.length}/500 characters
      </p>
    </div>

    <div className="flex justify-end gap-2 border-t border-line pt-4">
      <Button
        size="sm"
        variant="secondary"
        onClick={closeDecision}
        disabled={Boolean(processingId)}
      >
        Cancel
      </Button>

      <Button
        size="sm"
        variant="danger"
        loading={Boolean(processingId)}
        disabled={!rejectionReason.trim()}
        onClick={confirmDecision}
      >
        Reject visitor
      </Button>
    </div>
  </div>
</Modal>

    </div>
  );
};

export default VisitorApprovalPage;
