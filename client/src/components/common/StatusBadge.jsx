const styles = {
  approved: { chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  pending: { chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  rejected: { chip: "bg-red-50 text-red-700", dot: "bg-red-500" },
  checked_in: { chip: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  checked_out: { chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

const fallback = styles.checked_out;

const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase().replaceAll(" ", "_");
  const { chip, dot } = styles[key] || fallback;

  const label = String(status || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
