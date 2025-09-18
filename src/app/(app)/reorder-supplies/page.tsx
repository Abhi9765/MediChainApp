
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { mockInventory, mockVendors } from '@/lib/data';
import type { InventoryItem, Vendor } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
};

const getNextPoNumber = () => {
    // In a real app, this would be generated server-side to avoid collisions
    const prefix = `PO-${new Date().getFullYear()}-`;
    const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${prefix}${randomSuffix}`;
};

export default function ReorderSuppliesPage() {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [expectedDate, setExpectedDate] = useState<Date | undefined>();
    const [notes, setNotes] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const { toast } = useToast();

    const vendorOptions = mockVendors.filter(v => v.status === 'Active').map(v => ({ value: v.vendorId, label: v.vendorName }));
    const itemOptions = mockInventory.map(i => ({ value: i.id, label: `${i.name} (${i.id})`}));
    
    const addItemToOrder = () => {
        if (!selectedItem) {
            toast({ variant: 'destructive', title: 'No item selected' });
            return;
        }

        const itemToAdd = mockInventory.find(i => i.id === selectedItem);
        if (!itemToAdd) return;

        setOrderItems(prev => {
            const existingItem = prev.find(i => i.id === itemToAdd.id);
            if (existingItem) {
                return prev.map(i => i.id === itemToAdd.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: itemToAdd.id, name: itemToAdd.name, quantity: 1 }];
        });
        setSelectedItem('');
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
        if (orderItems.length === 0 || !selectedVendor) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a vendor and add items to the order.',
            });
            return;
        }

        const poNumber = getNextPoNumber();
        console.log("Submitting Purchase Order:", {
            poNumber,
            vendorId: selectedVendor,
            items: orderItems,
            expectedDate,
            notes,
            status: 'Pending'
        });

        toast({
            title: 'Order Placed Successfully',
            description: `Purchase Order ${poNumber} has been created and is pending approval.`,
        });

        // Reset form
        setOrderItems([]);
        setSelectedVendor('');
        setExpectedDate(undefined);
        setNotes('');
        setSelectedItem('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Create Purchase Order
                </CardTitle>
                <CardDescription>
                    Select a vendor, add items, and generate a new purchase order.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vendor</label>
                        <SearchableSelect 
                            options={vendorOptions}
                            value={selectedVendor}
                            onValueChange={setSelectedVendor}
                            placeholder="Select a vendor"
                        />
                    </div>
                    <div className="space-y-2">
                         <label className="text-sm font-medium">Expected Delivery Date</label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !expectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={expectedDate}
                                onSelect={setExpectedDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Add Item</label>
                    <div className="flex gap-2">
                        <div className="flex-grow">
                             <SearchableSelect 
                                options={itemOptions}
                                value={selectedItem}
                                onValueChange={setSelectedItem}
                                placeholder="Search and select an item..."
                            />
                        </div>
                        <Button onClick={addItemToOrder} disabled={!selectedItem}>
                            <PlusCircle className="mr-2" /> Add
                        </Button>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead className="w-[120px]">Quantity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.length > 0 ? orderItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
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
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        Your order is empty.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">Remarks / Notes</label>
                    <Textarea 
                        id="notes" 
                        placeholder="Add any special instructions for this order..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={submitOrder} className="w-full" disabled={orderItems.length === 0 || !selectedVendor}>
                    Submit Purchase Order
                </Button>
            </CardFooter>
        </Card>
    );
}

