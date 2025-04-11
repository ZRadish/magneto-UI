"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
// import { ChartContainer, type ChartConfig } from "../components/ui/chart";

interface OracleBarChartProps {
  data: { oracle: string; count: number }[];
}
import type { TooltipProps } from "recharts";

const pieColors = [
  "#a78bfa", "#7c3aed", "#5b21b6", "#c084fc", "#9333ea", "#6b21a8",
  "#e879f9", "#c026d3", "#86198f", "#f472b6", "#db2777", "#9d174d",
];

const getColor = (index: number) => pieColors[index % pieColors.length];

// const chartConfig: ChartConfig = {
//   count: {
//     label: "Tests",
//     color: "hsl(var(--chart-1))",
//   },
// };

const CustomBarTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
  
    const { count } = payload[0].payload;
  
    return (
      <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg shadow-md border border-violet-600">
        <div className="flex items-center gap-2">
          {/* <span className="text-white font-medium">{oracle}</span> */}
          <span className="text-white text-base font-semibold">{count} tests</span>
        </div>
      </div>
    );
  };

const OracleBarChart: React.FC<OracleBarChartProps> = ({ data }) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-semibold text-gray-200">
          Tests by Oracle Type
        </CardTitle>
        <CardDescription className="text-gray-400">
          Distribution of oracle usage
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke="#3f3f46" strokeDasharray="3 3" />
            <XAxis
              dataKey="oracle"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis hide />
            <Tooltip cursor={false} content={<CustomBarTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} isAnimationActive={true}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OracleBarChart;
