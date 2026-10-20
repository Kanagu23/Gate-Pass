
const formatVisitorTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const VisitorTimeCell = ({ inTime, outTime }) => (
  <div className="min-w-[145px] space-y-1.5 text-xs">
    <div className="flex items-baseline gap-2">
      <span className="w-7 shrink-0 font-medium text-slate-500">
        IN
      </span>

      <span className="text-slate-700">
        {formatVisitorTime(inTime)}
      </span>
    </div>

    <div className="flex items-baseline gap-2">
      <span className="w-7 shrink-0 font-medium text-slate-500">
        OUT
      </span>

      <span className="text-slate-700">
        {formatVisitorTime(outTime)}
      </span>
    </div>
  </div>
);

export default VisitorTimeCell;
