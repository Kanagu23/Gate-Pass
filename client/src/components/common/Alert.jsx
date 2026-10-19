import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const tones = {
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-500",
    role: "alert",
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    role: "status",
  },
  info: {
    box: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Info,
    iconColor: "text-blue-500",
    role: "status",
  },
};

const Alert = ({ tone = "info", title, children, onDismiss, className = "" }) => {
  const { box, icon: Icon, iconColor, role } = tones[tone] || tones.info;

  return (
    <div
      role={role}
      className={`animate-pop flex items-start gap-2.5 rounded-card border px-3 py-2.5 text-[13px] ${box} ${className}`}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;
