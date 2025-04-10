"use client"

import React, { useMemo } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";
// import { TrendingUp } from "lucide-react"
import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"

type Props = {
  data: { appName: string; testCount: number; color?: string }[]
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;
  
    const { name, value, fill } = payload[0];
  
    return (
      <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg shadow-md border border-violet-600">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{name}</span>
          <span className="text-white text-base font-semibold">{value}</span>
        </div>
      </div>
    );
  };
  

const PieDonutChart: React.FC<Props> = ({ data }) => {
  const total = useMemo(() => {
    return data.reduce((sum, curr) => sum + curr.testCount, 0)
  }, [data])

  return (
    <Card className="flex flex-col w-full h-full p-4">
  <CardHeader className="text-center space-y-1">
    <CardTitle className="text-lg font-semibold text-gray-200">
      Tests Breakdown by App
    </CardTitle>
    <CardDescription className="text-gray-400 text-sm">
      Test distribution across all of your apps
    </CardDescription>
  </CardHeader>

  <CardContent className="flex flex-col items-center justify-center gap-4">
    <ResponsiveContainer width={200} height={200}>
      <PieChart>
        <RechartsTooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          dataKey="testCount"
          nameKey="appName"
          innerRadius={60}
          outerRadius={80}
          stroke="#1f2937"
          strokeWidth={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="text-3xl font-bold fill-gray-100"
                  >
                    {total.toLocaleString()}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy + 24}
                    className="fill-gray-400 text-sm"
                  >
                    Tests
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </CardContent>

  <CardFooter className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-400 text-right">
    {data.length > 0 && (
      <>
        <div className="flex justify-between w-full">
          <span className="text-muted-foreground">Most tested app:</span>
          <span className="text-white font-medium">
            {
              data.reduce((prev, curr) =>
                curr.testCount > prev.testCount ? curr : prev
              ).appName
            }
          </span>
        </div>
        <div className="flex justify-between w-full">
          <span className="text-muted-foreground">Least tested app:</span>
          <span className="text-white font-medium">
            {
              data.reduce((prev, curr) =>
                curr.testCount < prev.testCount ? curr : prev
              ).appName
            }
          </span>
        </div>
      </>
    )}
  </CardFooter>
</Card>

  )
}

export default PieDonutChart