
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Building, PlusCircle, Search } from "lucide-react";
import { mockVendors } from '@/lib/data';
import type { Vendor } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialNewVendorState: Omit<Vendor, 'vendorId'> = {
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    deliveryTimeEstimate: '',
    status: 'Active',
};

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
    const [filter, setFilter] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newVendor, setNewVendor] = useState(initialNewVendorState);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewVendor(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: 'status' | 'paymentTerms', value: string) => {
        setNewVendor(prev => ({ ...prev, [id]: value }));
    };

    const handleVendorSubmit = () => {
        if (!newVendor.vendorName || !newVendor.email) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a vendor name and email.',
            });
            return;
        }

        const newEntry: Vendor = {
            vendorId: `VEND${String(vendors.length + 1).padStart(3, '0')}`,
            ...newVendor,
        };

        setVendors(prev => [newEntry, ...prev]);
        setIsDialogOpen(false);
        setNewVendor(initialNewVendorState);

        toast({
            title: 'Vendor Added',
            description: `"${newVendor.vendorName}" has been added to the master list.`,
        });
    };

    const filteredVendors = vendors.filter(v => 
        v.vendorName.toLowerCase().includes(filter.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(filter.toLowerCase()) ||
        v.email.toLowerCase().includes(filter.toLowerCase())
    );
    
    const getStatusVariant = (status: Vendor['status']): "default" | "secondary" => {
        return status === 'Active' ? 'default' : 'secondary';
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Vendor Management
                        </CardTitle>
                        <CardDescription>Manage your list of suppliers and vendors.</CardDescription>
                    </div>
                     <Button size="sm" className="h-9 gap-1" onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Vendor</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search vendors by name, contact, or email..."
                            className="w-full rounded-lg bg-card pl-8 md:w-[400px]"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vendor Master List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Email & Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                                    <TableRow key={vendor.vendorId}>
                                        <TableCell>
                                            <div className="font-medium">{vendor.vendorName}</div>
                                            <div className="text-xs text-muted-foreground">{vendor.vendorId}</div>
                                        </TableCell>
                                        <TableCell>{vendor.contactPerson}</TableCell>
                                        <TableCell>
                                             <div className="text-sm">{vendor.email}</div>
                                             <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(vendor.status)}>{vendor.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No vendors found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Vendor</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the new vendor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vendorName">Vendor Name <span className="text-destructive">*</span></Label>
                                <Input id="vendorName" value={newVendor.vendorName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input id="contactPerson" value={newVendor.contactPerson} onChange={handleInputChange} />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                                <Input id="email" type="email" value={newVendor.email} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={newVendor.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={newVendor.address} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Payment Terms</Label>
                                <Select onValueChange={(v) => handleSelectChange('paymentTerms', v)} value={newVendor.paymentTerms}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Net 30">Net 30</SelectItem>
                                        <SelectItem value="Net 60">Net 60</SelectItem>
                                        <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deliveryTimeEstimate">Delivery Estimate</Label>
                                <Input id="deliveryTimeEstimate" placeholder="e.g., 5-7 days" value={newVendor.deliveryTimeEstimate} onChange={handleInputChange} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(v) => handleSelectChange('status', v as 'Active' | 'Inactive')} value={newVendor.status}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleVendorSubmit}>Save Vendor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
