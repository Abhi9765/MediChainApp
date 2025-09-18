

"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText, Search } from "lucide-react";
import { mockPurchaseOrders, mockVendors, mockInventory } from '@/lib/data';
import type { PurchaseOrder } from '@/types';
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTablePagination } from '@/components/ui/pagination';


export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState('all');


    const getVendorName = (vendorId: string) => {
        return mockVendors.find(v => v.vendorId === vendorId)?.vendorName || 'Unknown';
    };

    const getTotalItems = (items: PurchaseOrder['items']) => {
        return items.reduce((acc, item) => acc + item.quantity, 0);
    };

    const getStatusVariant = (status: PurchaseOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "Completed":
                return "default";
            case "Partially Received":
            case "Dispatched":
                return "secondary";
            case "Pending":
                return "outline";
            case "Cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };
    
    const filteredOrders = orders.filter(o => 
        o.poNumber.toLowerCase().includes(filter.toLowerCase()) ||
        getVendorName(o.vendorId).toLowerCase().includes(filter.toLowerCase())
    );
    
    const renderTable = (status?: PurchaseOrder['status']) => {
        const data = status ? filteredOrders.filter(o => o.status === status) : filteredOrders;
        const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        
        return (
            <div className='flex flex-col h-full'>
                <div className="border rounded-lg overflow-y-auto flex-grow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Expected Date</TableHead>
                                <TableHead className="text-center">Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? paginatedData.map(order => (
                                <TableRow key={order.poNumber}>
                                    <TableCell className="font-medium">{order.poNumber}</TableCell>
                                    <TableCell>{getVendorName(order.vendorId)}</TableCell>
                                    <TableCell>{format(order.orderDate, "dd MMM yyyy")}</TableCell>
                                    <TableCell>{order.expectedDate ? format(order.expectedDate, "dd MMM yyyy") : 'N/A'}</TableCell>
                                    <TableCell className="text-center">{getTotalItems(order.items)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                                <DropdownMenuItem>Receive Stock</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <DataTablePagination
                    count={data.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            </div>
        )
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPage(0);
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Purchase Orders
                    </CardTitle>
                    <CardDescription>Track and manage all purchase orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by PO number or vendor name..."
                            className="w-full rounded-lg bg-card pl-8 md:w-[400px]"
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="Pending">Pending</TabsTrigger>
                    <TabsTrigger value="Dispatched">Dispatched</TabsTrigger>
                    <TabsTrigger value="Partially Received">Partial</TabsTrigger>
                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="flex-grow overflow-hidden">{renderTable()}</TabsContent>
                <TabsContent value="Pending" className="flex-grow overflow-hidden">{renderTable("Pending")}</TabsContent>
                <TabsContent value="Dispatched" className="flex-grow overflow-hidden">{renderTable("Dispatched")}</TabsContent>
                <TabsContent value="Partially Received" className="flex-grow overflow-hidden">{renderTable("Partially Received")}</TabsContent>
                <TabsContent value="Completed" className="flex-grow overflow-hidden">{renderTable("Completed")}</TabsContent>
            </Tabs>
        </div>
    );
}
