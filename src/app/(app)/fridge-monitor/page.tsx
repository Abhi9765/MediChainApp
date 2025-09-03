"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Thermometer, Droplets, AlertTriangle, History, CalendarDays } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Timeframe = "24h" | "7d" | "30d";

type CriticalEvent = {
  time: Date;
  type: "High Temperature" | "Low Temperature" | "Power Outage";
  details: string;
};

type FridgeDataPoint = {
  time: string;
  temperature: number;
  humidity: number;
};

type Fridge = {
  id: string;
  location: string;
  temperature: number;
  humidity: number;
  status: "Normal" | "Warning" | "Danger";
  history: FridgeDataPoint[];
  criticalEvents: CriticalEvent[];
  tempRange: { min: number, max: number };
};

const initialFridgeData: Omit<Fridge, "history" | "criticalEvents">[] = [
  {
    id: "FR001",
    location: "Main Pharmacy",
    temperature: 4.2,
    humidity: 55,
    status: "Normal",
    tempRange: { min: 2, max: 8 },
  },
  {
    id: "FR002",
    location: "ICU",
    temperature: 8.5,
    humidity: 60,
    status: "Warning",
    tempRange: { min: 2, max: 8 },
  },
  {
    id: "FR003",
    location: "Surgery OT",
    temperature: 3.1,
    humidity: 52,
    status: "Normal",
    tempRange: { min: 2, max: 8 },
  },
  {
    id: "FR004",
    location: "Pediatrics Ward",
    temperature: -1.5,
    humidity: 48,
    status: "Danger",
    tempRange: { min: 2, max: 8 },
  },
];

const generateHistory = (baseTemp: number, baseHumidity: number, timeframe: Timeframe): FridgeDataPoint[] => {
    const data: FridgeDataPoint[] = [];
    const now = new Date();
    let points = 24; // Default for 24h
    let interval = 60 * 60 * 1000; // 1 hour

    if (timeframe === '7d') {
        points = 7 * 4; // 4 points per day
        interval = 6 * 60 * 60 * 1000; // 6 hours
    } else if (timeframe === '30d') {
        points = 30; // 1 point per day
        interval = 24 * 60 * 60 * 1000; // 24 hours
    }

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * interval);
        data.push({
            time: timeframe === '24h' ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString(),
            temperature: parseFloat((baseTemp + (Math.random() - 0.5) * (i % 5)).toFixed(1)),
            humidity: Math.round(baseHumidity + (Math.random() - 0.5) * 5),
        });
    }
    return data;
}

const generateCriticalEvents = (fridgeId: string): CriticalEvent[] => {
    const events: CriticalEvent[] = [];
    if (fridgeId === 'FR002') {
        events.push({ time: new Date(Date.now() - 3 * 60 * 60 * 1000), type: 'High Temperature', details: 'Reached 8.9°C' });
    }
    if (fridgeId === 'FR004') {
        events.push({ time: new Date(Date.now() - 1 * 60 * 60 * 1000), type: 'Low Temperature', details: 'Dropped to -2.0°C' });
        events.push({ time: new Date(Date.now() - 12 * 60 * 60 * 1000), type: 'Power Outage', details: 'Power restored after 15 mins' });
    }
    return events;
}

const chartConfig = {
    temperature: { label: "Temp (°C)", color: "hsl(var(--chart-1))" },
    humidity: { label: "Humidity (%)", color: "hsl(var(--chart-2))" }
};

export default function FridgeMonitorPage() {
    const [fridgeData, setFridgeData] = useState<Fridge[]>([]);
    const [timeframe, setTimeframe] = useState<Timeframe>("24h");

    useEffect(() => {
        const initializedData = initialFridgeData.map(fridge => ({
            ...fridge,
            history: generateHistory(fridge.temperature, fridge.humidity, timeframe),
            criticalEvents: generateCriticalEvents(fridge.id),
        }));
        setFridgeData(initializedData);
    }, [timeframe]);
  
  const getStatusColor = (status: Fridge["status"]) => {
    switch(status) {
        case "Normal": return "text-green-500 bg-green-500/10 border-green-500/20";
        case "Warning": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        case "Danger": return "text-red-500 bg-red-500/10 border-red-500/20";
    }
  }

  const getEventTypeVariant = (type: CriticalEvent['type']) => {
      if (type === 'Power Outage') return 'secondary';
      return 'destructive';
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1.5">
                 <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-6 w-6" />
                    Fridge Fleet Monitoring
                </CardTitle>
                <CardDescription>Live status overview of all refrigerated storage units.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground"/>
                 <Select onValueChange={(value) => setTimeframe(value as Timeframe)} value={timeframe}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {fridgeData.map((fridge) => (
            <Card key={fridge.id} className="flex flex-col">
                 <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{fridge.location}</CardTitle>
                            <CardDescription>{fridge.id} | Temp Range: {fridge.tempRange.min}°C - {fridge.tempRange.max}°C</CardDescription>
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${getStatusColor(fridge.status)}`}>
                            <AlertTriangle className="h-4 w-4" />
                            <span>{fridge.status}</span>
                        </div>
                    </div>
                 </CardHeader>
                 <CardContent className="flex-grow grid gap-4">
                    <div className="flex items-center justify-around text-center">
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <Thermometer className="h-6 w-6 text-muted-foreground" />
                            <span>{fridge.temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="flex items-center gap-2 text-xl font-medium">
                            <Droplets className="h-5 w-5 text-muted-foreground" />
                            <span>{fridge.humidity}%</span>
                        </div>
                    </div>
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart accessibilityLayer data={fridge.history} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                            <YAxis yAxisId="left" stroke="var(--color-temperature)" domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                     <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                           <History className="h-4 w-4"/> Critical Event Log
                        </h4>
                        {fridge.criticalEvents.length > 0 ? (
                             <div className="border rounded-lg overflow-hidden text-xs">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fridge.criticalEvents.map((event, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{event.time.toLocaleTimeString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getEventTypeVariant(event.type)}>{event.type}</Badge>
                                                </TableCell>
                                                <TableCell>{event.details}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No critical events in the selected timeframe.</p>
                        )}
                    </div>
                 </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
