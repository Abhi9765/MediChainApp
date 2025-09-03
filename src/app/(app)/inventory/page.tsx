import { mockInventory } from "@/lib/data";
import { InventoryPageClient } from "./inventory-client";

export default function InventoryPage() {
  // In a real app, you would fetch this data from an API
  const inventoryData = mockInventory;

  return <InventoryPageClient data={inventoryData} />;
}
