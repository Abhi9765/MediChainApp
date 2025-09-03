"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

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
};

const initialFridgeData: Fridge[] = [
  {
    id: "FR001",
    location: "Main Pharmacy",
    temperature: 4.2,
    humidity: 55,
    status: "Normal",
    history: [],
  },
  {
    id: "FR002",
    location: "ICU",
    temperature: 8.5,
    humidity: 60,
    status: "Warning",
    history: [],
  },
  {
    id: "FR003",
    location: "Surgery OT",
    temperature: 3.1,
    humidity: 52,
    status: "Normal",
    history: [],
  },
   {
    id: "FR004",
    location: "Pediatrics Ward",
    temperature: -1.5,
    humidity: 48,
    status: "Danger",
    history: [],
  },
];

const generateHistory = (baseTemp: number, baseHumidity: number): FridgeDataPoint[] => {
    const data: FridgeDataPoint[] = [];
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000);
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: parseFloat((baseTemp + (Math.random() - 0.5) * 0.5).toFixed(1)),
            humidity: Math.round(baseHumidity + (Math.random() - 0.5) * 2),
        });
    }
    return data;
}

const chartConfig = {
    temperature: {
        label: "Temperature (°C)",
        color: "hsl(var(--chart-1))",
    },
    humidity: {
        label: "Humidity (%)",
        color: "hsl(var(--chart-2))",
    }
}

export default function FridgeMonitorPage() {
    const [fridgeData, setFridgeData] = useState<Fridge[]>([]);
    const [selectedFridgeId, setSelectedFridgeId] = useState<string | null>(null);

    useEffect(() => {
        const initializedData = initialFridgeData.map(fridge => ({
            ...fridge,
            history: generateHistory(fridge.temperature, fridge.humidity),
        }));
        setFridgeData(initializedData);
        if (initializedData.length > 0) {
            setSelectedFridgeId(initializedData[0].id);
        }

        const interval = setInterval(() => {
            setFridgeData(prevData => prevData.map(fridge => {
                const newTemp = parseFloat((fridge.temperature + (Math.random() - 0.5) * 0.2).toFixed(1));
                const newHumidity = Math.round(fridge.humidity + (Math.random() - 0.5));
                const newStatus = newTemp < 2 || newTemp > 8 ? "Danger" : newTemp < 3 || newTemp > 7 ? "Warning" : "Normal";
                const newHistory = [
                    ...fridge.history.slice(1),
                    {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        temperature: newTemp,
                        humidity: newHumidity,
                    }
                ];
                return { ...fridge, temperature: newTemp, humidity: newHumidity, status: newStatus, history: newHistory };
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);
  
  const getStatusColor = (status: Fridge["status"]) => {
    switch(status) {
        case "Normal": return "text-green-500";
        case "Warning": return "text-yellow-500";
        case "Danger": return "text-red-500";
    }
  }

  const selectedFridge = fridgeData.find(f => f.id === selectedFridgeId);

  return (
    <div className="grid gap-6">
      <Card className="max-w-xs">
          <CardHeader>
              <Label htmlFor="fridge-select">Select Fridge</Label>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedFridgeId} value={selectedFridgeId || ''}>
                <SelectTrigger id="fridge-select">
                    <SelectValue placeholder="Select a fridge" />
                </SelectTrigger>
                <SelectContent>
                    {fridgeData.map(fridge => (
                        <SelectItem key={fridge.id} value={fridge.id}>
                            {fridge.location} ({fridge.id})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </CardContent>
      </Card>
      
      {selectedFridge && (
        <div className='grid gap-6 lg:grid-cols-5'>
            <div className='lg:col-span-3 grid gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedFridge.location} - Live Monitoring</CardTitle>
                        <CardDescription>Last 60 minutes of temperature and humidity readings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <LineChart data={selectedFridge.history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="time" />
                                <YAxis yAxisId="left" stroke="var(--color-temperature)" />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-humidity)" />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature" stroke="var(--color-temperature)" strokeWidth={2} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity" stroke="var(--color-humidity)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Reading History</CardTitle>
                         <CardDescription>Detailed log of the last hour's sensor readings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="border rounded-lg overflow-hidden">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">Temperature (°C)</TableHead>
                                <TableHead className="text-right">Humidity (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...selectedFridge.history].reverse().map((reading, index) => (
                                <TableRow key={index}>
                                    <TableCell>{reading.time}</TableCell>
                                    <TableCell className="text-right">{reading.temperature.toFixed(1)}</TableCell>
                                    <TableCell className="text-right">{reading.humidity}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                       </div>
                    </CardContent>
                </Card>
            </div>
            <div className='lg:col-span-2'>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{selectedFridge.location}</CardTitle>
                            <AlertTriangle className={`h-5 w-5 ${getStatusColor(selectedFridge.status)}`} />
                        </div>
                    <CardDescription>{selectedFridge.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-3xl font-bold">
                            <Thermometer className="h-7 w-7 text-muted-foreground" />
                            <span>{selectedFridge.temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="flex items-center gap-2 text-2xl">
                            <Droplets className="h-6 w-6 text-muted-foreground" />
                            <span>{selectedFridge.humidity}%</span>
                        </div>
                         <div className={`p-3 rounded-md bg-muted/50 flex items-center gap-3 ${getStatusColor(selectedFridge.status)}`}>
                            <AlertTriangle className="h-5 w-5" />
                            <div className='font-semibold'>
                                <p>Status: {selectedFridge.status}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
      )}
    </div>
  );
}
