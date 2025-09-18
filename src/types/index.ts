export type InventoryItem = {
  id: string;
  name: string;
  category: 'Medicines' | 'Consumables' | 'Surgical';
  quantity: number;
  expiryDate: Date;
  manufacturer: string;
  batchNumber: string;
  location: string;
};

export type Vendor = {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  deliveryTimeEstimate: string; // e.g., "5-7 days"
  status: "Active" | "Inactive";
};

export type PurchaseOrder = {
  poNumber: string;
  vendorId: string;
  orderDate: Date;
  expectedDate?: Date;
  items: {
    itemId: string;
    quantity: number;
    receivedQuantity: number;
  }[];
  status: "Pending" | "Dispatched" | "Partially Received" | "Completed" | "Cancelled";
  notes?: string;
};
