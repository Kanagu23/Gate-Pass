
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
  },
  APPROVED: {
    label: "Approved",
    color: "#8b5cf6",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "#4169e8",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "#10b981",
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
  },
};

const VisitorStatusChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name:
      STATUS_CONFIG[item.status]?.label ??
      item.status,
    value: item.count,
    color:
      STATUS_CONFIG[item.status]?.color ??
      "#94a3b8",
  }));

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-[#10132e]">
          Visitor Status
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Distribution of visitor requests
        </p>
      </div>

      {total === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No visitor records available.
        </div>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="43%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  value,
                  name,
                ]}
                contentStyle={{
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default VisitorStatusChart;
