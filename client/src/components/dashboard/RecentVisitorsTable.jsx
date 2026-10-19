
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-violet-50 text-violet-700",
  CHECKED_IN: "bg-blue-50 text-blue-700",
  CHECKED_OUT: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RecentVisitorsTable = ({ visitors = [] }) => {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#10132e]">
            Recent Visitors
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest 10 visitor registrations
          </p>
        </div>

        <Link
          to="/admin/visitors"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#4169e8] hover:text-blue-800"
        >
          View All
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {visitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
          <Users size={28} className="text-slate-400" />
          <p className="text-sm text-slate-500">
            No visitors registered yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Visitor
                </th>
                <th className="px-5 py-3 font-medium">
                  Visiting Employee
                </th>
                <th className="px-5 py-3 font-medium">
                  Purpose
                </th>
                <th className="px-5 py-3 font-medium">
                  Status
                </th>
                <th className="px-5 py-3 font-medium">
                  Registered
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visitors.map((visitor) => (
                <tr
                  key={visitor._id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {visitor.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {visitor.visitorId}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {visitor.visitingEmployee?.name ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {visitor.visitingEmployee?.employeeId ?? "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {visitor.visitingPurpose ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[visitor.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {visitor.status?.replaceAll("_", " ") ?? "Unknown"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    {formatDate(visitor.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RecentVisitorsTable;
