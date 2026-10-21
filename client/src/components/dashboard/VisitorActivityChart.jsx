
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
const VisitorActivityChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    date: item.date,
    day: new Date(`${item.date}T00:00:00Z`).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        timeZone: "UTC",
      }
    ),
    visitors: item.visitors,
  }));

  return (
    <Card
  title="Visitor activity"
  description="Visitor registrations over the last 7 days"
  className="rise"
>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No activity data available.
        </div>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
  stroke="var(--color-line)"
  strokeDasharray="3 3"
  vertical={false}
/>

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 12,
                }}
              />

             
<Tooltip
  cursor={chartTheme.cursor}
  labelFormatter={(_, payload) =>
    payload?.[0]?.payload?.date ?? ""
  }
  contentStyle={chartTheme.tooltip}
  labelStyle={chartTheme.label}
  itemStyle={chartTheme.item}
/>


              <Bar
                dataKey="visitors"
                name="Visitors"
                fill="#4169e8"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default VisitorActivityChart;
