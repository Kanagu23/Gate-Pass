
import { useEffect, useState } from "react";
import { Clock3, X } from "lucide-react";

import { correctVisitorTime } from "../../api/visitor.api";

const toLocalInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
};

const toIso = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const EditVisitorTimeModal = ({
  visitor,
  onClose,
  onSaved,
}) => {
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visitor) return;

    setInTime(toLocalInput(visitor.inTime));
    setOutTime(toLocalInput(visitor.outTime));
    setReason("");
    setError("");
  }, [visitor]);

  if (!visitor) return null;

  const isCheckedOut = visitor.status === "CHECKED_OUT";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextInTime = toIso(inTime);
    const nextOutTime = isCheckedOut
      ? toIso(outTime)
      : null;

    if (!nextInTime || (isCheckedOut && !nextOutTime)) {
      setError("Please provide valid visit times.");
      return;
    }

    if (
      nextOutTime &&
      new Date(nextOutTime) < new Date(nextInTime)
    ) {
      setError("OUT time cannot be earlier than IN time.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Please enter at least 10 characters for the reason.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await correctVisitorTime(visitor._id, {
        inTime: nextInTime,
        outTime: nextOutTime,
        reason: reason.trim(),
      });

      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update visitor times."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-visitor-time-title"
        className="w-full max-w-md rounded-card border border-line bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-soft p-2 text-brand">
              <Clock3 size={18} />
            </div>

            <div>
              <h2
                id="edit-visitor-time-title"
                className="text-base font-semibold text-ink"
              >
                Correct Visit Times
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {visitor.name} · {visitor.visitorId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="correct-in-time"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              IN Time
            </label>

            <input
              id="correct-in-time"
              type="datetime-local"
              className="field w-full"
              value={inTime}
              onChange={(event) => setInTime(event.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="correct-out-time"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              OUT Time
            </label>

            <input
              id="correct-out-time"
              type="datetime-local"
              className="field w-full"
              value={outTime}
              onChange={(event) => setOutTime(event.target.value)}
              required={isCheckedOut}
              disabled={!isCheckedOut}
            />

            {!isCheckedOut && (
              <p className="mt-1 text-xs text-slate-400">
                OUT time is available after checkout.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="correction-reason"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Reason for correction
            </label>

            <textarea
              id="correction-reason"
              rows={3}
              maxLength={500}
              className="field w-full resize-none"
              placeholder="Explain why the recorded time needs correction..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}

          <p className="text-xs leading-5 text-slate-500">
            Changes are recorded in the visitor's correction history.
          </p>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-control border border-line px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-control bg-brand px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVisitorTimeModal;
