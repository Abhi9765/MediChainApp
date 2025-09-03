"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Search, Loader2 } from "lucide-react";
import { mockInventory } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/types';

export default function StockTransferPage() {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [transferQuantity, setTransferQuantity] = useState(1);
    const [toLocation, setToLocation] = useState('');
    
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
            title: 'Transfer Successful',
            description: `Transferred ${transferQuantity} units of ${selectedItem.name} to ${toLocation}.`,
        });

        // Reset form
        setSelectedItem(null);
        setSearchQuery('');
        setTransferQuantity(1);
        setToLocation('');
    }

    const availableLocations = ["Main Pharmacy", "ICU", "Surgery OT", "Pediatrics", "Cardiology", "General Ward"];

    return (
        <div className="flex justify-center items-start pt-10">
            <Card className="w-full max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-6 w-6" />
                            Stock Transfer
                        </CardTitle>
                        <CardDescription>
                            Move inventory items from one location to another.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="searchItem">Search Item (by Name or ID)</Label>
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
                                <Label htmlFor="quantity">Transfer Quantity</Label>
                                <Input 
                                    id="quantity" 
                                    type="number" 
                                    value={transferQuantity}
                                    onChange={(e) => setTransferQuantity(parseInt(e.target.value, 10))}
                                    min="1"
                                    max={selectedItem?.quantity}
                                    disabled={!selectedItem}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="toLocation">To Location</Label>
                                <Select onValueChange={setToLocation} value={toLocation} disabled={!selectedItem}>
                                    <SelectTrigger id="toLocation">
                                        <SelectValue placeholder="Select destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLocations
                                            .filter(loc => loc !== selectedItem?.location)
                                            .map(loc => (
                                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={!selectedItem || !toLocation} className="w-full">
                            Confirm Transfer
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
