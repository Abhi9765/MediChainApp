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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Complaint = (typeof mockComplaints)[0];

type DialogState = {
    isOpen: boolean;
    complaintId?: string;
    mode: 'assign' | 'resolve' | 'details';
};

const initialNewComplaintState = {
    itemName: '',
    batchNumber: '',
    vendor: '',
    issueType: '',
    description: '',
    attachment: null as File | null,
};

export default function InspectionPage() {
    const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
    const [filter, setFilter] = useState("");
    const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
    const [newComplaint, setNewComplaint] = useState(initialNewComplaintState);
    const [actionDialog, setActionDialog] = useState<DialogState>({ isOpen: false, mode: 'details' });
    const [dialogInput, setDialogInput] = useState('');
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setNewComplaint(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setNewComplaint(prev => ({ ...prev, issueType: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewComplaint(prev => ({ ...prev, attachment: e.target.files?.[0] || null }));
        }
    };

    const handleComplaintSubmit = () => {
        if (!newComplaint.itemName || !newComplaint.issueType || !newComplaint.batchNumber) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill in all required fields (Item, Batch No, Issue Type).',
            });
            return;
        }

        const newEntry: Complaint = {
            id: `CMP${String(complaints.length + 1).padStart(3, '0')}`,
            ...newComplaint,
            status: 'Open',
            raisedOn: new Date(),
            assignedTo: 'Admin',
            hasAttachment: !!newComplaint.attachment,
        };

        setComplaints(prev => [newEntry, ...prev]);
        setIsNewComplaintOpen(false);
        setNewComplaint(initialNewComplaintState);

        toast({
            title: 'Complaint Raised',
            description: `Issue for "${newComplaint.itemName}" has been logged.`,
        });
    };

    const handleDialogSubmit = () => {
        if (!actionDialog.complaintId || !dialogInput) {
            toast({ variant: 'destructive', title: 'Input required.'});
            return;
        }

        if (actionDialog.mode === 'assign') {
            setComplaints(prev => prev.map(c => c.id === actionDialog.complaintId ? {...c, assignedTo: dialogInput, status: 'In Review'} : c));
            toast({ title: 'Complaint Assigned', description: `Assigned to ${dialogInput}.` });
        } else if (actionDialog.mode === 'resolve') {
            setComplaints(prev => prev.map(c => c.id === actionDialog.complaintId ? {...c, status: 'Resolved', resolutionNote: dialogInput} : c));
            toast({ title: 'Complaint Resolved', description: 'The complaint has been marked as resolved.' });
        }

        setActionDialog({ isOpen: false, mode: 'details' });
        setDialogInput('');
    };

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
    
    const openActionDialog = (complaintId: string, mode: DialogState['mode']) => {
        setActionDialog({ isOpen: true, complaintId, mode });
    };

    const selectedComplaint = complaints.find(c => c.id === actionDialog.complaintId);
    
    const getDialogContent = () => {
        if (!selectedComplaint) return null;

        switch (actionDialog.mode) {
            case 'details':
                return {
                    title: 'Complaint Details',
                    description: `Details for complaint #${selectedComplaint.id}.`,
                    body: (
                        <div className="space-y-4 text-sm">
                           <p><strong>Item:</strong> {selectedComplaint.itemName} (Batch: {selectedComplaint.batchNumber})</p>
                           <p><strong>Vendor:</strong> {selectedComplaint.vendor}</p>
                           <p><strong>Issue:</strong> {selectedComplaint.issueType}</p>
                           <p><strong>Description:</strong> {selectedComplaint.description}</p>
                           {selectedComplaint.resolutionNote && <p><strong>Resolution Note:</strong> {selectedComplaint.resolutionNote}</p>}
                        </div>
                    ),
                    footer: <Button variant="outline" onClick={() => setActionDialog({isOpen: false, mode: 'details'})}>Close</Button>
                };
            case 'assign':
                return {
                    title: 'Assign Complaint',
                    description: 'Assign this complaint to a staff member for review.',
                    body: (
                        <>
                            <Label htmlFor="assignee">Staff Name</Label>
                            <Input id="assignee" value={dialogInput} onChange={e => setDialogInput(e.target.value)} placeholder="e.g., John Doe" />
                        </>
                    ),
                    footer: <><Button variant="outline" onClick={() => setActionDialog({isOpen: false, mode: 'details'})}>Cancel</Button><Button onClick={handleDialogSubmit}>Assign</Button></>
                };
            case 'resolve':
                 return {
                    title: 'Add Resolution Note',
                    description: 'Add a final note and mark this complaint as resolved.',
                    body: (
                        <>
                            <Label htmlFor="resolution">Resolution Note</Label>
                            <Textarea id="resolution" value={dialogInput} onChange={e => setDialogInput(e.target.value)} placeholder="Describe the resolution..." />
                        </>
                    ),
                    footer: <><Button variant="outline" onClick={() => setActionDialog({-isOpen: false, mode: 'details'})}>Cancel</Button><Button onClick={handleDialogSubmit}>Resolve</Button></>
                };
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6" />
                            Inspection & Complaints
                        </CardTitle>
                        <CardDescription>Raise and track issues with received materials.</CardDescription>
                    </div>
                     <Button size="sm" className="h-9 gap-1" onClick={() => setIsNewComplaintOpen(true)}>
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

            <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <CardTitle>Complaint Log</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <div className="border rounded-lg overflow-y-auto h-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Issue Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Raised On</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Attachment</TableHead>
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
                                            {complaint.hasAttachment && <Paperclip className="h-4 w-4" />}
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
                                                    <DropdownMenuItem onClick={() => openActionDialog(complaint.id, 'details')}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openActionDialog(complaint.id, 'assign')}>Assign Staff</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openActionDialog(complaint.id, 'resolve')}>Add Resolution Note</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            No complaints found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isNewComplaintOpen} onOpenChange={setIsNewComplaintOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Raise a New Complaint</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the material issue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="itemName" className="text-right">Item <span className="text-destructive">*</span></Label>
                            <Input id="itemName" value={newComplaint.itemName} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batchNumber" className="text-right">Batch No. <span className="text-destructive">*</span></Label>
                            <Input id="batchNumber" value={newComplaint.batchNumber} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vendor" className="text-right">Vendor</Label>
                            <Input id="vendor" value={newComplaint.vendor} onChange={handleInputChange} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="issueType" className="text-right">Issue Type <span className="text-destructive">*</span></Label>
                            <Select onValueChange={handleSelectChange} value={newComplaint.issueType}>
                                <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an issue" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Defective">Defective</SelectItem>
                                    <SelectItem value="Duplicate">Duplicate</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">Description</Label>
                            <Textarea id="description" value={newComplaint.description} onChange={handleInputChange} placeholder="Describe the issue in detail..." className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Attachment</Label>
                            <div className="col-span-3">
                                <Button asChild variant="outline" size="sm">
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        {newComplaint.attachment ? newComplaint.attachment.name : "Upload Photo"}
                                    </label>
                                </Button>
                                <Input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewComplaintOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleComplaintSubmit}>Submit Complaint</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={actionDialog.isOpen} onOpenChange={(isOpen) => setActionDialog(prev => ({...prev, isOpen}))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{getDialogContent()?.title}</DialogTitle>
                        <DialogDescription>{getDialogContent()?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {getDialogContent()?.body}
                    </div>
                    <DialogFooter>
                        {getDialogContent()?.footer}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    