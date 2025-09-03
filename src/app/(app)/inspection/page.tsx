"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ShieldAlert, Paperclip, Search, PlusCircle } from "lucide-react";
import { mockComplaints } from '@/lib/data';
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Complaint = (typeof mockComplaints)[0];

export default function InspectionPage() {
    const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
    const [filter, setFilter] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredComplaints = complaints.filter(c => 
        c.itemName.toLowerCase().includes(filter.toLowerCase()) ||
        c.batchNumber.toLowerCase().includes(filter.toLowerCase()) ||
        c.vendor.toLowerCase().includes(filter.toLowerCase())
    );

    const getStatusVariant = (status: Complaint['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "Resolved":
                return "default";
            case "In Review":
                return "secondary";
            case "Open":
                return "outline";
            case "Escalated":
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6" />
                            Inspection & Complaints
                        </CardTitle>
                        <CardDescription>Raise and track issues with received materials.</CardDescription>
                    </div>
                     <Button size="sm" className="h-9 gap-1" onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Raise Complaint</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search complaints by item, batch, or vendor..."
                            className="w-full rounded-lg bg-card pl-8 md:w-[400px]"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Complaint Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Issue Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Raised On</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredComplaints.length > 0 ? filteredComplaints.map(complaint => (
                                    <TableRow key={complaint.id}>
                                        <TableCell>
                                            <div className="font-medium">{complaint.itemName}</div>
                                            <div className="text-xs text-muted-foreground">Batch: {complaint.batchNumber}</div>
                                        </TableCell>
                                        <TableCell>{complaint.vendor}</TableCell>
                                        <TableCell>{complaint.issueType}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                                        </TableCell>
                                        <TableCell>{format(complaint.raisedOn, "dd MMM yyyy")}</TableCell>
                                        <TableCell>{complaint.assignedTo}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Assign Staff</DropdownMenuItem>
                                                    <DropdownMenuItem>Add Resolution Note</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No complaints found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Raise a New Complaint</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the material issue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item" className="text-right">Item</Label>
                            <Input id="item" defaultValue="Paracetamol 500mg" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batch" className="text-right">Batch No.</Label>
                            <Input id="batch" defaultValue="B12345" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vendor" className="text-right">Vendor</Label>
                            <Input id="vendor" defaultValue="Pharma Inc." className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="issueType" className="text-right">Issue Type</Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an issue" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="defective">Defective</SelectItem>
                                    <SelectItem value="duplicate">Duplicate</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">Description</Label>
                            <Textarea id="description" placeholder="Describe the issue in detail..." className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="attachment" className="text-right">Attachment</Label>
                            <div className="col-span-3">
                                <Button asChild variant="outline" size="sm">
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </label>
                                </Button>
                                <Input id="file-upload" type="file" className="hidden" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={() => setIsDialogOpen(false)}>Submit Complaint</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
