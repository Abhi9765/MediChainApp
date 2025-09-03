"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockAnalytics, mockInventory } from "@/lib/data";
import { ArrowDown, ArrowUp, PackageOpen, TriangleAlert } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { addDays, isBefore } from "date-fns";

const chartConfig: ChartConfig = {
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

const pieChartConfig = {
  value: {
    label: "Items",
  },
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
} satisfies ChartConfig;

export default function DashboardPage() {
    const nearExpiryThreshold = addDays(new Date(), 60);
    const nearExpiryItems = mockInventory.filter(item => isBefore(item.expiryDate, nearExpiryThreshold) && isBefore(new Date(), item.expiryDate)).length;
    const expiredItems = mockInventory.filter(item => isBefore(item.expiryDate, new Date())).length;
    const totalItems = mockInventory.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Nearing Expiry</CardTitle>
            <TriangleAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nearExpiryItems}</div>
            <p className="text-xs text-muted-foreground">Within next 60 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wastage (Expired)</CardTitle>
            <ArrowDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredItems}</div>
            <p className="text-xs text-muted-foreground">-5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnaround</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5 days</div>
            <p className="text-xs text-muted-foreground">+2% faster than last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock Levels Overview</CardTitle>
            <CardDescription>Monthly stock levels by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={mockAnalytics.stockLevel}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Medicines" fill="var(--color-Medicines)" radius={4} />
                <Bar dataKey="Consumables" fill="var(--color-Consumables)" radius={4} />
                <Bar dataKey="Surgical" fill="var(--color-Surgical)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Wastage by Category</CardTitle>
             <CardDescription>Breakdown of expired items in the last quarter.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
             <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
            >
                <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={mockAnalytics.wastage} dataKey="value" nameKey="name" innerRadius={60} />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
