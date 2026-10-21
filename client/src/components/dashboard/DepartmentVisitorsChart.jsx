
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "../common/Card";
import { chartTheme } from "../../config/chartTheme";

const DepartmentVisitorsChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    department: item.department,
    visitors: item.count,
  }));

  const hasData = chartData.some(
    (item) => item.visitors > 0
  );

  return (
    <Card
      title="Department-wise visitors"
      description="Visitor registrations by visiting employee department"
      className="rise"
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No department data available.
        </div>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 12,
                left: 15,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke={chartTheme.grid}
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 12,
                }}
              />

              <YAxis
                type="category"
                dataKey="department"
                width={100}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 11,
                }}
              />

             
<Tooltip
  cursor={chartTheme.cursor}
  contentStyle={chartTheme.tooltip}
  labelStyle={chartTheme.label}
  itemStyle={chartTheme.item}
/>


              <Bar
                dataKey="visitors"
                name="Visitors"
                fill="#4169e8"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default DepartmentVisitorsChart;
