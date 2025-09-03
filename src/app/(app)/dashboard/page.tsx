"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { mockAnalytics, mockInventory } from "@/lib/data";
import { ArrowDown, ArrowUp, PackageOpen, TriangleAlert, FileDown, ArchiveX } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { addDays, isBefore, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

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
    const { toast } = useToast();
    const nearExpiryThreshold = addDays(new Date(), 60);
    const lowStockThreshold = 100;

    const nearExpiryItems = mockInventory.filter(item => isBefore(item.expiryDate, nearExpiryThreshold) && isBefore(new Date(), item.expiryDate)).length;
    const expiredItems = mockInventory.filter(item => isBefore(item.expiryDate, new Date())).length;
    const lowStockItems = mockInventory.filter(item => item.quantity < lowStockThreshold).length;
    const totalItems = mockInventory.reduce((acc, item) => acc + item.quantity, 0);

    const handleReportDownload = (formatType: 'CSV' | 'PDF') => {
        const headers = [
            "ID", "Name", "Category", "Quantity", "Expiry Date", 
            "Manufacturer", "Batch Number", "Location"
        ];
        
        if (formatType === 'CSV') {
            const csvRows = [
                headers.join(','),
                ...mockInventory.map(item => [
                    item.id,
                    `"${item.name.replace(/"/g, '""')}"`, // Handle quotes in name
                    item.category,
                    item.quantity,
                    format(item.expiryDate, 'yyyy-MM-dd'),
                    `"${item.manufacturer.replace(/"/g, '""')}"`,
                    item.batchNumber,
                    item.location
                ].join(','))
            ];
            
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'inventory_report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: 'Report Downloaded',
                description: `Your CSV report has been downloaded.`,
            });
        } else {
             const doc = new jsPDF();
             const reportTitle = "Inventory Report";
             const reportDate = `Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`;

             doc.setFontSize(18);
             doc.text(reportTitle, 14, 22);
             doc.setFontSize(11);
             doc.setTextColor(100);
             doc.text(reportDate, 14, 28);
             
             autoTable(doc, {
                 startY: 35,
                 head: [headers],
                 body: mockInventory.map(item => [
                     item.id,
                     item.name,
                     item.category,
                     item.quantity,
                     format(item.expiryDate, 'yyyy-MM-dd'),
                     item.manufacturer,
                     item.batchNumber,
                     item.location
                 ]),
             });
             doc.save('inventory_report.pdf');

             toast({
                title: 'Report Downloaded',
                description: `Your PDF report has been downloaded.`,
            });
        }
    }

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
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <ArchiveX className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below threshold of 100 units</p>
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
        <div className="lg:col-span-3 grid gap-4 auto-rows-min">
             <Card>
                <CardHeader>
                    <CardTitle>Report Generation</CardTitle>
                    <CardDescription>Download system reports in various formats.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-around gap-4">
                     <Button variant="outline" className="w-full" onClick={() => handleReportDownload('CSV')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download CSV
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleReportDownload('PDF')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Wastage by Category</CardTitle>
                    <CardDescription>Breakdown of expired items in the last quarter.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 -mt-4">
                    <ChartContainer
                        config={pieChartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={mockAnalytics.wastage} dataKey="value" nameKey="name" innerRadius={50} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
