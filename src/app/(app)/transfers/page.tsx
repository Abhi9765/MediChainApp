"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Truck, Search, Loader2, PlusCircle } from "lucide-react";
import { mockInventory, mockTransfers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Transfer = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  from: string;
  to: string;
  date: Date;
  status: "Completed" | "In Transit" | "Pending";
};

export default function StockTransferPage() {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [transferQuantity, setTransferQuantity] = useState(1);
    const [toLocation, setToLocation] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const { toast } = useToast();

    const handleSearch = () => {
        if (!searchQuery) return;
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            const results = mockInventory.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(results);
            setIsSearching(false);
        }, 500);
    };

    const handleSelectItem = (itemId: string) => {
        const item = mockInventory.find(i => i.id === itemId);
        if (item) {
            setSelectedItem(item);
            setSearchResults([]);
            setSearchQuery(item.name);
            setTransferQuantity(1);
        }
    };

    const resetForm = () => {
        setSelectedItem(null);
        setSearchQuery('');
        setTransferQuantity(1);
        setToLocation('');
        setSearchResults([]);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !toLocation || transferQuantity <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Transfer',
                description: 'Please select an item, destination, and valid quantity.',
            });
            return;
        }

        if (transferQuantity > selectedItem.quantity) {
             toast({
                variant: 'destructive',
                title: 'Insufficient Stock',
                description: `Only ${selectedItem.quantity} units available for transfer.`,
            });
            return;
        }
        
        console.log({
            itemId: selectedItem.id,
            from: selectedItem.location,
            to: toLocation,
            quantity: transferQuantity
        });

        toast({
            title: 'Transfer Initiated',
            description: `Transfer of ${transferQuantity} units of ${selectedItem.name} to ${toLocation} is now pending.`,
        });

        // Reset form and close sheet
        resetForm();
        setIsSheetOpen(false);
    }

    const availableLocations = ["North Branch Clinic", "Southside Medical Center", "East Wing Hospital", "West End Health Hub", "Downtown Urgent Care"];
    
    const locationOptions = availableLocations
        .filter(loc => loc !== selectedItem?.location)
        .map(loc => ({ value: loc, label: loc }));

    const getStatusVariant = (status: Transfer['status']) => {
        switch(status) {
            case 'Completed': return 'default';
            case 'In Transit': return 'secondary';
            case 'Pending': return 'outline';
            default: return 'default';
        }
    }

    return (
        <div className="grid gap-6">
            <Card>
                 <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Truck className="h-6 w-6" />
                           Transfer History
                        </CardTitle>
                        <CardDescription>
                            Log of all inventory movements to other hospital branches.
                        </CardDescription>
                    </div>
                     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                             <Button size="sm" className="h-9 gap-1" onClick={() => setIsSheetOpen(true)}>
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Transfer</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-lg">
                            <form onSubmit={handleSubmit}>
                                <SheetHeader>
                                    <SheetTitle>Create Stock Transfer</SheetTitle>
                                    <SheetDescription>
                                        Move inventory from main storage to a child branch.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-6 py-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="searchItem">Search Item (by Name or ID) <span className="text-destructive">*</span></Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="searchItem"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="e.g., Paracetamol or ITM001"
                                            />
                                            <Button type="button" onClick={handleSearch} disabled={isSearching}>
                                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="border rounded-md max-h-40 overflow-y-auto">
                                                {searchResults.map(item => (
                                                    <div key={item.id} onClick={() => handleSelectItem(item.id)} className="p-2 hover:bg-muted cursor-pointer">
                                                        <p className="font-medium">{item.name} <span className="text-sm text-muted-foreground">({item.id})</span></p>
                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Location: {item.location}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedItem && (
                                        <div className="grid sm:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                                        <div>
                                            <Label>Item</Label>
                                            <p className="font-semibold">{selectedItem.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedItem.id}</p>
                                        </div>
                                        <div>
                                            <Label>From Location</Label>
                                            <p className="font-semibold">{selectedItem.location}</p>
                                        </div>
                                        <div>
                                            <Label>Available Quantity</Label>
                                            <p className="font-semibold">{selectedItem.quantity}</p>
                                        </div>
                                        </div>
                                    )}
                                    
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Transfer Quantity <span className="text-destructive">*</span></Label>
                                            <Input 
                                                id="quantity" 
                                                type="number" 
                                                value={transferQuantity}
                                                onChange={(e) => setTransferQuantity(parseInt(e.target.value, 10))}
                                                min="1"
                                                max={selectedItem?.quantity}
                                                disabled={!selectedItem}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="toLocation">To Hospital <span className="text-destructive">*</span></Label>
                                            <SearchableSelect
                                                options={locationOptions}
                                                value={toLocation}
                                                onValueChange={setToLocation}
                                                placeholder="Select destination"
                                                disabled={!selectedItem}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                    </SheetClose>
                                    <Button type="submit" disabled={!selectedItem || !toLocation}>
                                        Confirm Transfer
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To Hospital</TableHead>
                            <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTransfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell>
                                <div className="font-medium">{transfer.itemName}</div>
                                <div className="text-xs text-muted-foreground">{format(transfer.date, "dd MMM, HH:mm")}</div>
                                </TableCell>
                                <TableCell className="text-right">{transfer.quantity}</TableCell>
                                <TableCell>{transfer.from}</TableCell>
                                <TableCell>{transfer.to}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(transfer.status)}>{transfer.status}</Badge>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
