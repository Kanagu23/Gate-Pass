
const statusStyles = {
  approved: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  checked_in: "bg-blue-50 text-blue-700 ring-blue-600/20",
  checked_out: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase().replaceAll(" ", "_");
  const styles =
    statusStyles[key] || "bg-slate-100 text-slate-600 ring-slate-500/20";

  const label = String(status || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
