
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

const VisitorPurposeChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    purpose: item.purpose,
    visitors: item.count,
  }));

  const hasData = chartData.some(
    (item) => item.visitors > 0
  );

  return (
    <Card
      title="Visitors by purpose"
      description="Visitor registrations grouped by visiting purpose"
      className="rise"
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No visitor purpose data available.
        </div>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 15,
                left: 10,
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
                dataKey="purpose"
                width={85}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 12,
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

export default VisitorPurposeChart;
