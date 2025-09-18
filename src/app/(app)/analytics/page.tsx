"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockAnalytics, mockInventory } from "@/lib/data";
import type { ChartConfig } from "@/components/ui/chart";
import type { InventoryItem } from "@/types";
import { SearchableSelect } from "@/components/ui/searchable-select";

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

const consumptionConfig: ChartConfig = {
    value: {
        label: "Items Consumed",
        color: "hsl(var(--chart-4))",
    }
}

const generateRandomData = (base: number) => {
    return Array.from({ length: 6 }, (_, i) => {
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i];
        const actual = Math.floor(base * (1 + (Math.random() - 0.2) * 0.5) * (i + 1) / 3);
        const forecast = Math.floor(actual * (1 + (Math.random() - 0.5) * 0.2));
        return { month, actual, forecast };
    });
};

const generateConsumptionData = (base: number) => {
    return [
        { department: "Cardiology", value: Math.floor(base * Math.random() * 2) },
        { department: "ICU", value: Math.floor(base * Math.random() * 4) },
        { department: "Surgery OT", value: Math.floor(base * Math.random() * 5) },
        { department: "Pediatrics", value: Math.floor(base * Math.random() * 1.5) },
        { department: "General Ward", value: Math.floor(base * Math.random() * 3) },
    ].sort((a,b) => b.value - a.value);
};

export default function AnalyticsPage() {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(mockInventory.find(item => item.name === 'Paracetamol 500mg'));
    const [demandData, setDemandData] = useState(generateRandomData(150));
    const [consumptionData, setConsumptionData] = useState(generateConsumptionData(300));

    useEffect(() => {
        if (selectedItem) {
            const baseDemand = selectedItem.quantity / 50;
            const baseConsumption = selectedItem.quantity / 20;
            setDemandData(generateRandomData(baseDemand));
            setConsumptionData(generateConsumptionData(baseConsumption));
        }
    }, [selectedItem]);
    
    const handleItemChange = (itemId: string) => {
        const item = mockInventory.find(i => i.id === itemId);
        setSelectedItem(item);
    }
    
    const itemOptions = mockInventory.map(item => ({
        value: item.id,
        label: item.name
    }));

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Analytics Dashboard</CardTitle>
                    <CardDescription>Visualize trends and consumption patterns.</CardDescription>
                </div>
                <div className="w-[300px]">
                    <SearchableSelect
                        options={itemOptions}
                        value={selectedItem?.id || ''}
                        onValueChange={handleItemChange}
                        placeholder="Select an item to analyze"
                    />
                </div>
            </CardHeader>
        </Card>

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
                <CardDescription>AI-powered demand forecast for {selectedItem?.name || '...'} vs actual usage.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={demandForecastConfig} className="min-h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={demandData}
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
                <CardDescription>Total {selectedItem?.name || 'items'} consumed by each department last month.</CardDescription>
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
