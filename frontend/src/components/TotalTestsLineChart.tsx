"use client"

import { LineChart, Line, CartesianGrid, XAxis } from "recharts"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "../components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"

interface Props {
  data: { month: string; totalTests: number }[]
}

const chartConfig = {
  totalTests: {
    label: "Tests",
    color: "hsl(var(--chart-1))",
  },
};

const TotalTestsLineChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="w-full h-full">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-semibold text-gray-200">
          Total Tests Over Time
        </CardTitle>
        <CardDescription className="text-gray-400">
          Since you joined
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 h-60">
        <ChartContainer config={chartConfig} className="h-full">
          <LineChart data={data} margin={{ left: 10, right: 10 }}>
            <CartesianGrid vertical={false} stroke="#2a2a3c" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="monotone"
              dataKey="totalTests"
              stroke="var(--color-totalTests)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TotalTestsLineChart