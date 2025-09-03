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
