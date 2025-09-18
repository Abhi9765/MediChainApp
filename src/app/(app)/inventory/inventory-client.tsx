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
import { format, isBefore, parseISO, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyItem: Omit<InventoryItem, 'id'> = {
  name: '',
  category: 'Medicines',
  quantity: 0,
  expiryDate: new Date(),
  manufacturer: '',
  batchNumber: '',
  location: '',
};

export function InventoryPageClient({ data: initialData }: { data: InventoryItem[] }) {
  const [inventoryData, setInventoryData] = React.useState<InventoryItem[]>(initialData);
  const [filter, setFilter] = React.useState("");
  const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | Omit<InventoryItem, 'id'>>(emptyItem);
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

  const handleOpenDialog = (item?: InventoryItem) => {
    setEditingItem(item ? { ...item } : emptyItem);
    setIsItemDialogOpen(true);
  };
  
  const handleSaveChanges = () => {
    const isEditing = 'id' in editingItem;
    if (!editingItem.name || !editingItem.category || !editingItem.quantity) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill in all required fields.',
        });
        return;
    }

    if (isEditing) {
      setInventoryData(prev => prev.map(i => i.id === (editingItem as InventoryItem).id ? (editingItem as InventoryItem) : i));
      toast({ title: 'Item Updated', description: `"${editingItem.name}" has been updated.` });
    } else {
      const newItem: InventoryItem = {
        id: `ITM${String(inventoryData.length + 1).padStart(3, '0')}`,
        ...editingItem
      } as InventoryItem;
      setInventoryData(prev => [newItem, ...prev]);
      toast({ title: 'Item Added', description: `"${newItem.name}" has been added to inventory.` });
    }

    setIsItemDialogOpen(false);
    setEditingItem(emptyItem);
  };

  const handleRemoveItem = (itemId: string) => {
    setInventoryData(prev => prev.filter(i => i.id !== itemId));
    toast({ title: 'Item Removed', description: 'The item has been removed from inventory.' });
  };
  
  const categoryOptions = [
      { value: "Medicines", label: "Medicines" },
      { value: "Consumables", label: "Consumables" },
      { value: "Surgical", label: "Surgical" }
  ];

  const locationOptions = [...new Set(inventoryData.map(i => i.location))].map(l => ({ value: l, label: l }));

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
            <Button size="sm" className="h-9 gap-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={() => handleOpenDialog()}>
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
                    <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon!', description: 'Transfer functionality will be implemented soon.'})}>
                                Transfer
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                  Remove
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the item "{item.name}" from your inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveItem(item.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{'id' in editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              Fill in the details of the inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                    <Input id="name" value={editingItem.name} onChange={(e) => setEditingItem(prev => ({...prev, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                    <SearchableSelect
                        options={categoryOptions}
                        value={editingItem.category}
                        onValueChange={(value) => setEditingItem(prev => ({...prev, category: value as typeof editingItem.category}))}
                        placeholder="Select a category"
                    />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity <span className="text-destructive">*</span></Label>
                    <Input id="quantity" type="number" value={editingItem.quantity} onChange={(e) => setEditingItem(prev => ({...prev, quantity: parseInt(e.target.value, 10)}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date <span className="text-destructive">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !editingItem.expiryDate && "text-muted-foreground")}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingItem.expiryDate ? format(editingItem.expiryDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={editingItem.expiryDate}
                            onSelect={(date) => setEditingItem(prev => ({...prev, expiryDate: date || new Date()}))}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input id="manufacturer" value={editingItem.manufacturer} onChange={(e) => setEditingItem(prev => ({...prev, manufacturer: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input id="batchNumber" value={editingItem.batchNumber} onChange={(e) => setEditingItem(prev => ({...prev, batchNumber: e.target.value}))} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                 <SearchableSelect
                    options={locationOptions}
                    value={editingItem.location}
                    onValueChange={(value) => setEditingItem(prev => ({...prev, location: value}))}
                    placeholder="Select a location"
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} onClick={handleSaveChanges}>
                {'id' in editingItem ? 'Save Changes' : 'Save Item'}
            </Button>
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

    