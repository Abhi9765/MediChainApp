"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, QrCode, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { InventoryItem } from "@/types";
import { format, isBefore } from "date-fns";

export function InventoryPageClient({ data }: { data: InventoryItem[] }) {
  const [filter, setFilter] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.id.toLowerCase().includes(filter.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(filter.toLowerCase())
  );

  const getBadgeVariant = (expiryDate: Date) => {
    const now = new Date();
    const in60Days = new Date();
    in60Days.setDate(now.getDate() + 60);

    if (isBefore(expiryDate, now)) {
      return "destructive";
    }
    if (isBefore(expiryDate, in60Days)) {
      return "secondary";
    }
    return "outline";
  };

  const getBadgeText = (expiryDate: Date) => {
    const now = new Date();
    if (isBefore(expiryDate, now)) {
      return "Expired";
    }
    return format(expiryDate, "MMM yyyy");
  };

    const categoryOptions = [
        { value: "medicines", label: "Medicines" },
        { value: "consumables", label: "Consumables" },
        { value: "surgical", label: "Surgical" }
    ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, ID, or batch..."
            className="w-full rounded-lg bg-card pl-8 md:w-[300px] lg:w-[400px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-9 gap-1 md:hidden" onClick={() => setIsDialogOpen(true)}>
                <QrCode className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Scan QR</span>
            </Button>
            <Button size="sm" className="h-9 gap-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Item</span>
            </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden flex-grow relative">
        <div className="absolute inset-0 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Batch: {item.batchNumber}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(item.expiryDate)}>
                      {getBadgeText(item.expiryDate)}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Transfer</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Fill in the details of the new inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" defaultValue="Paracetamol 500mg" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <div className="col-span-3">
                <SearchableSelect
                    options={categoryOptions}
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    placeholder="Select a category"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" defaultValue="100" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={() => setIsDialogOpen(false)}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
