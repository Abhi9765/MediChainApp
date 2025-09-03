"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { format } from "date-fns";

type Transfer = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  from: string;
  to: string;
  date: Date;
  status: "Completed" | "In Transit" | "Pending";
};

const mockTransfers: Transfer[] = [
  {
    id: "TRN001",
    itemId: "ITM004",
    itemName: "Amoxicillin 250mg",
    quantity: 50,
    from: "Main Pharmacy",
    to: "Pediatrics",
    date: new Date("2024-05-20T10:30:00Z"),
    status: "Completed",
  },
  {
    id: "TRN002",
    itemId: "ITM002",
    itemName: "Sterile Gloves (M)",
    quantity: 100,
    from: "Surgery OT",
    to: "ICU",
    date: new Date("2024-05-22T14:00:00Z"),
    status: "Completed",
  },
  {
    id: "TRN003",
    itemId: "ITM006",
    itemName: "Aspirin 81mg",
    quantity: 200,
    from: "Cardiology",
    to: "Main Pharmacy",
    date: new Date(),
    status: "In Transit",
  },
    {
    id: "TRN004",
    itemId: "ITM005",
    itemName: "IV Drip Set",
    quantity: 25,
    from: "ICU",
    to: "General Ward",
    date: new Date(),
    status: "Pending",
  },
];

export default function TransfersPage() {

    const getStatusVariant = (status: Transfer['status']) => {
        switch(status) {
            case 'Completed': return 'default';
            case 'In Transit': return 'secondary';
            case 'Pending': return 'outline';
            default: return 'default';
        }
    }

  return (
    <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">{transfer.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{transfer.itemName}</div>
                  <div className="text-xs text-muted-foreground">{transfer.itemId}</div>
                </TableCell>
                <TableCell className="text-right">{transfer.quantity}</TableCell>
                <TableCell>{transfer.from}</TableCell>
                <TableCell>{transfer.to}</TableCell>
                <TableCell>{format(transfer.date, "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell>
                    <Badge variant={getStatusVariant(transfer.status)}>{transfer.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
