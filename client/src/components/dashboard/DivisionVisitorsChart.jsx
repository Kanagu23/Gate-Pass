    
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
import { divisionName } from "../../config/divisions";
import { chartTheme } from "../../config/chartTheme";

const DivisionVisitorsChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    division: divisionName(item.division),
    visitors: item.count,
  }));

  const hasData = chartData.some(
    (item) => item.visitors > 0
  );

  return (
    <Card
      title="Division-wise visitors"
      description="Compare visitor registrations across divisions"
      className="rise"
    >
      {!hasData ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No division data available.
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
                bottom: 25,
              }}
            >
              <CartesianGrid
                stroke={chartTheme.grid}
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="division"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={55}
                tick={{
                  fill: chartTheme.axis,
                  fontSize: 11,
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

export default DivisionVisitorsChart;
