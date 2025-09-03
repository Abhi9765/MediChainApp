"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    supplier: string;
};

const lowStockItems: Omit<OrderItem, 'quantity'>[] = [
    { id: "ITM007", name: "Ibuprofen 200mg", supplier: "Global Health" },
    { id: "ITM004", name: "Amoxicillin 250mg", supplier: "Global Health" },
    { id: "ITM005", name: "IV Drip Set", supplier: "MediSupply Co." },
];

export default function ReorderSuppliesPage() {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const { toast } = useToast();

    const addItemToOrder = (item: Omit<OrderItem, 'quantity'>) => {
        setOrderItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 100 } : i);
            }
            return [...prev, { ...item, quantity: 100 }];
        });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity > 0) {
            setOrderItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
        }
    };
    
    const removeItem = (itemId: string) => {
        setOrderItems(prev => prev.filter(i => i.id !== itemId));
    };

    const submitOrder = () => {
        if (orderItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Empty Order',
                description: 'Please add items to the order before submitting.',
            });
            return;
        }

        console.log("Submitting order:", orderItems);

        toast({
            title: 'Order Placed Successfully',
            description: `Purchase order with ${orderItems.length} items has been sent.`,
        });

        setOrderItems([]);
    };

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Items</CardTitle>
                        <CardDescription>Click to add items to your purchase order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.supplier}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => addItemToOrder(item)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6" />
                            Create Purchase Order
                        </CardTitle>
                        <CardDescription>Review and submit your order for new supplies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead className="w-[120px]">Quantity</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.length > 0 ? orderItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.supplier}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                                                    className="h-8"
                                                    min="1"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                Your order is empty.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={submitOrder} className="w-full" disabled={orderItems.length === 0}>
                            Submit Purchase Order
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
