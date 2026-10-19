import { useEffect, useRef } from "react";
import Button from "./Button";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    cancelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="animate-fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="animate-pop relative w-full max-w-sm rounded-card bg-white p-4 shadow-pop"
      >
        <h2 id="confirm-title" className="text-sm font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{message}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="h-8 rounded-control border border-line-strong px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.97] disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            size="sm"
            variant={confirmVariant}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
