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
import { MoreHorizontal, PlusCircle, QrCode, Search, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { InventoryItem } from "@/types";
import { format, isBefore, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export function InventoryPageClient({ data: initialData }: { data: InventoryItem[] }) {
  const [inventoryData, setInventoryData] = React.useState<InventoryItem[]>(initialData);
  const [filter, setFilter] = React.useState("");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const { toast } = useToast();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredFields = ["name", "category", "quantity", "expiryDate", "manufacturer", "batchNumber", "location"];
        const headers = results.meta.fields || [];
        const missingHeaders = requiredFields.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            toast({
                variant: 'destructive',
                title: "CSV Import Error",
                description: `Missing required columns: ${missingHeaders.join(', ')}`,
            });
            return;
        }
        
        const newItems: InventoryItem[] = [];
        let errorOccurred = false;

        results.data.forEach((row, index) => {
          if(errorOccurred) return;
          
          if (!row.name || !row.category || !row.quantity || !row.expiryDate) {
             toast({
                variant: 'destructive',
                title: `Row ${index + 2} skipped`,
                description: `Missing required data in row.`,
             });
             return;
          }

          const newItem: InventoryItem = {
            id: `ITM${String(inventoryData.length + newItems.length + 1).padStart(3, '0')}`,
            name: row.name,
            category: row.category as InventoryItem['category'],
            quantity: parseInt(row.quantity, 10),
            expiryDate: parseISO(row.expiryDate),
            manufacturer: row.manufacturer,
            batchNumber: row.batchNumber,
            location: row.location,
          };

          if (isNaN(newItem.quantity) || isNaN(newItem.expiryDate.getTime())) {
              toast({
                  variant: 'destructive',
                  title: `CSV Import Error on row ${index + 2}`,
                  description: `Invalid quantity or date format for item "${row.name}".`,
              });
              errorOccurred = true;
              return;
          }
          newItems.push(newItem);
        });

        if (!errorOccurred) {
            setInventoryData(prev => [...prev, ...newItems]);
            toast({
                title: "Import Successful",
                description: `${newItems.length} items have been added to the inventory.`,
            });
            setIsImportDialogOpen(false);
        }
      },
      error: (error) => {
          toast({
              variant: 'destructive',
              title: "CSV Parsing Error",
              description: error.message,
          });
      }
    });
  };

  const filteredData = inventoryData.filter(
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
      { value: "Medicines", label: "Medicines" },
      { value: "Consumables", label: "Consumables" },
      { value: "Surgical", label: "Surgical" }
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
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Import CSV</span>
            </Button>
            <Button size="sm" className="h-9 gap-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={() => setIsAddItemDialogOpen(true)}>
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
                        <DropdownMenuItem onClick={() => setIsAddItemDialogOpen(true)}>Edit</DropdownMenuItem>
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
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Fill in the details of the new inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name <span className="text-destructive">*</span></Label>
              <Input id="name" defaultValue="Paracetamol 500mg" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category <span className="text-destructive">*</span></Label>
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
              <Label htmlFor="quantity" className="text-right">Quantity <span className="text-destructive">*</span></Label>
              <Input id="quantity" type="number" defaultValue="100" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={() => setIsAddItemDialogOpen(false)}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Import from CSV</DialogTitle>
                <DialogDescription>
                    Upload a CSV file to bulk-add items to the inventory.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="text-sm p-3 bg-muted rounded-md">
                    <p className="font-semibold">CSV Format Instructions:</p>
                    <p>Your file must contain the following headers:</p>
                    <code className="text-xs font-mono">name, category, quantity, expiryDate, manufacturer, batchNumber, location</code>
                    <p className="mt-2">The <code className="text-xs">expiryDate</code> must be in <code className="text-xs">YYYY-MM-DD</code> format.</p>
                </div>
                <div>
                     <Label htmlFor="csv-file" className="sr-only">CSV file</Label>
                     <Input id="csv-file" type="file" accept=".csv" onChange={handleFileImport} />
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
