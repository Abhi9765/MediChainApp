"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockAnalytics } from "@/lib/data";
import type { ChartConfig } from "@/components/ui/chart";

const stockLevelConfig: ChartConfig = {
  Medicines: {
    label: "Medicines",
    color: "hsl(var(--chart-1))",
  },
  Consumables: {
    label: "Consumables",
    color: "hsl(var(--chart-2))",
  },
  Surgical: {
    label: "Surgical",
    color: "hsl(var(--chart-3))",
  },
};

const demandForecastConfig: ChartConfig = {
    actual: {
        label: "Actual Usage",
        color: "hsl(var(--chart-2))",
    },
    forecast: {
        label: "AI Forecast",
        color: "hsl(var(--chart-1))",
    }
}

const consumptionData = [
  { department: "Cardiology", value: 450 },
  { department: "ICU", value: 780 },
  { department: "Surgery OT", value: 1200 },
  { department: "Pediatrics", value: 320 },
  { department: "General Ward", value: 950 },
];
const consumptionConfig: ChartConfig = {
    value: {
        label: "Items Consumed",
        color: "hsl(var(--chart-4))",
    }
}

export default function AnalyticsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Movement</CardTitle>
          <CardDescription>
            Trend of stock quantities for each category over the past 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={stockLevelConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={mockAnalytics.stockLevel}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Medicines" stackId="a" fill="var(--color-Medicines)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Consumables" stackId="a" fill="var(--color-Consumables)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Surgical" stackId="a" fill="var(--color-Surgical)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Demand Forecast</CardTitle>
                <CardDescription>AI-powered demand forecast for Paracetamol vs actual usage.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={demandForecastConfig} className="min-h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={[
                            { month: 'Jan', actual: 450, forecast: 480 },
                            { month: 'Feb', actual: 520, forecast: 500 },
                            { month: 'Mar', actual: 600, forecast: 620 },
                            { month: 'Apr', actual: 580, forecast: 550 },
                            { month: 'May', actual: 700, forecast: 680 },
                            { month: 'Jun', actual: 750, forecast: 720 },
                        ]}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={true} />
                        <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Consumption by Department</CardTitle>
                <CardDescription>Total items consumed by each department last month.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={consumptionConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={consumptionData} layout="vertical">
                    <YAxis dataKey="department" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                    <XAxis type="number" dataKey="value" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" layout="vertical" fill="var(--color-value)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
