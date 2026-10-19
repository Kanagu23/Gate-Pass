
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";

import Avatar from "../common/Avatar";
import Card from "../common/Card";
import EmptyState from "../common/EmptyState";
import StatusBadge from "../common/StatusBadge";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const RecentVisitorsTable = ({ visitors = [] }) => {
  return (
    <Card
      title="Recent visitors"
      description="Latest 10 visitor registrations"
      padded={false}
      action={
        <Link
          to="/admin/visitors"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          View all
          <ArrowUpRight size={13} />
        </Link>
      }
    >
      {visitors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No recent visitors"
          description="New visitor registrations will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="tbl min-w-[760px]">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Visiting employee</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {visitors.slice(0, 10).map((visitor) => (
                <tr key={visitor._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={visitor.name} />

                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {visitor.name}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {visitor.visitorId || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <p className="text-slate-700">
                      {visitor.visitingEmployee?.name || "—"}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">
                      {visitor.visitingEmployee?.employeeId || "—"}
                    </p>
                  </td>

                  <td className="text-slate-600">
                    {visitor.visitingPurpose || "—"}
                  </td>

                  <td>
                    <StatusBadge status={visitor.status} />
                  </td>

                  <td className="whitespace-nowrap text-xs text-slate-500">
                    {formatDate(visitor.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RecentVisitorsTable;
