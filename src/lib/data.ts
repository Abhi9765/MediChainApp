import type { Complaint, InventoryItem, PurchaseOrder, Vendor } from "@/types";

export const mockInventory: InventoryItem[] = [
  {
    id: "ITM001",
    name: "Paracetamol 500mg",
    category: "Medicines",
    quantity: 1500,
    expiryDate: new Date("2025-12-31"),
    manufacturer: "Pharma Inc.",
    batchNumber: "B12345",
    location: "Main Pharmacy",
  },
  {
    id: "ITM002",
    name: "Sterile Gloves (M)",
    category: "Consumables",
    quantity: 500,
    expiryDate: new Date("2026-06-30"),
    manufacturer: "MediSupply Co.",
    batchNumber: "G67890",
    location: "Surgery OT",
  },
  {
    id: "ITM003",
    name: "Scalpel #10",
    category: "Surgical",
    quantity: 200,
    expiryDate: new Date("2027-01-31"),
    manufacturer: "SurgiTools",
    batchNumber: "S54321",
    location: "Surgery OT",
  },
  {
    id: "ITM004",
    name: "Amoxicillin 250mg",
    category: "Medicines",
    quantity: 800,
    // Near expiry for testing
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    manufacturer: "Global Health",
    batchNumber: "A11223",
    location: "Main Pharmacy",
  },
  {
    id: "ITM005",
    name: "IV Drip Set",
    category: "Consumables",
    quantity: 300,
    expiryDate: new Date("2025-08-31"),
    manufacturer: "MediSupply Co.",
    batchNumber: "IV44556",
    location: "ICU",
  },
  {
    id: "ITM006",
    name: "Aspirin 81mg",
    category: "Medicines",
    quantity: 2000,
    expiryDate: new Date("2024-11-30"),
    manufacturer: "Pharma Inc.",
    batchNumber: "B98765",
    location: "Cardiology",
  },
  // Expired item for testing
  {
    id: "ITM007",
    name: "Ibuprofen 200mg",
    category: "Medicines",
    quantity: 50,
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    manufacturer: "Global Health",
    batchNumber: "I55667",
    location: "Main Pharmacy",
  },
  {
    id: "ITM008",
    name: "Insulin Glargine",
    category: "Medicines",
    quantity: 120,
    expiryDate: new Date("2025-05-31"),
    manufacturer: "Global Health",
    batchNumber: "IG88990",
    location: "Main Pharmacy",
  },
  {
    id: "ITM009",
    name: "Blood Bags",
    category: "Consumables",
    quantity: 40,
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    manufacturer: "MediSupply Co.",
    batchNumber: "BB12345",
    location: "ICU",
  },
  {
    id: "ITM010",
    name: "Vaccine XYZ",
    category: "Medicines",
    quantity: 75,
    expiryDate: new Date("2024-10-31"),
    manufacturer: "Pharma Inc.",
    batchNumber: "VXYZ789",
    location: "Pediatrics",
  },
];

export const mockAnalytics = {
    stockLevel: [
        { month: "Jan", Medicines: 4000, Consumables: 2400, Surgical: 1200 },
        { month: "Feb", Medicines: 3000, Consumables: 1398, Surgical: 1100 },
        { month: "Mar", Medicines: 2000, Consumables: 9800, Surgical: 900 },
        { month: "Apr", Medicines: 2780, Consumables: 3908, Surgical: 1300 },
        { month: "May", Medicines: 1890, Consumables: 4800, Surgical: 1000 },
        { month: "Jun", Medicines: 2390, Consumables: 3800, Surgical: 1500 },
    ],
    wastage: [
        { name: 'Medicines', value: 456, fill: 'hsl(var(--chart-1))' },
        { name: 'Consumables', value: 245, fill: 'hsl(var(--chart-2))' },
        { name: 'Surgical', value: 89, fill: 'hsl(var(--chart-3))' },
    ]
};

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

export const mockTransfers: Transfer[] = [
  {
    id: "TRN001",
    itemId: "ITM004",
    itemName: "Amoxicillin 250mg",
    quantity: 50,
    from: "Main Pharmacy",
    to: "North Branch Clinic",
    date: new Date("2024-05-20T10:30:00Z"),
    status: "Completed",
  },
  {
    id: "TRN002",
    itemId: "ITM002",
    itemName: "Sterile Gloves (M)",
    quantity: 100,
    from: "Surgery OT",
    to: "Southside Medical Center",
    date: new Date("2024-05-22T14:00:00Z"),
    status: "Completed",
  },
  {
    id: "TRN003",
    itemId: "ITM006",
    itemName: "Aspirin 81mg",
    quantity: 200,
    from: "Cardiology",
    to: "East Wing Hospital",
    date: new Date(),
    status: "In Transit",
  },
    {
    id: "TRN004",
    itemId: "ITM005",
    itemName: "IV Drip Set",
    quantity: 25,
    from: "ICU",
    to: "West End Health Hub",
    date: new Date(),
    status: "Pending",
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: 'CMP001',
    itemName: 'Paracetamol 500mg',
    batchNumber: 'B12345',
    vendor: 'Pharma Inc.',
    issueType: 'Defective',
    description: 'Tablets are discolored and broken.',
    status: 'Open',
    raisedOn: new Date(new Date().setDate(new Date().getDate() - 2)),
    assignedTo: 'Admin',
    hasAttachment: true,
  },
  {
    id: 'CMP002',
    itemName: 'Sterile Gloves (M)',
    batchNumber: 'G67890',
    vendor: 'MediSupply Co.',
    issueType: 'Duplicate',
    description: 'Received two boxes but only ordered one.',
    status: 'In Review',
    raisedOn: new Date(new Date().setDate(new Date().getDate() - 5)),
    assignedTo: 'John Doe',
    hasAttachment: false,
  },
  {
    id: 'CMP003',
    itemName: 'Ibuprofen 200mg',
    batchNumber: 'I55667',
    vendor: 'Global Health',
    issueType: 'Expired',
    description: 'Received items that were already expired.',
    status: 'Resolved',
    resolutionNote: 'Vendor agreed to replace the expired batch. New stock expected next week.',
    raisedOn: new Date(new Date().setDate(new Date().getDate() - 10)),
    assignedTo: 'Jane Smith',
    hasAttachment: true,
  },
    {
    id: 'CMP004',
    itemName: 'Scalpel #10',
    batchNumber: 'S54321',
    vendor: 'SurgiTools',
    issueType: 'Other',
    description: 'Packaging was damaged upon arrival.',
    status: 'Escalated',
    raisedOn: new Date(new Date().setDate(new Date().getDate() - 1)),
    assignedTo: 'Management',
    hasAttachment: true,
  },
];

export const mockVendors: Vendor[] = [
    {
        vendorId: "VEND001",
        vendorName: "Pharma Inc.",
        contactPerson: "John Smith",
        email: "john.smith@pharmainc.com",
        phone: "123-456-7890",
        address: "123 Pharma St, Health City, USA",
        paymentTerms: "Net 30",
        deliveryTimeEstimate: "5-7 business days",
        status: "Active"
    },
    {
        vendorId: "VEND002",
        vendorName: "MediSupply Co.",
        contactPerson: "Jane Doe",
        email: "jane.doe@medisupply.com",
        phone: "987-654-3210",
        address: "456 Supply Ave, Medville, USA",
        paymentTerms: "Net 60",
        deliveryTimeEstimate: "3-5 business days",
        status: "Active"
    },
    {
        vendorId: "VEND003",
        vendorName: "SurgiTools",
        contactPerson: "Peter Jones",
        email: "peter.jones@surgitools.com",
        phone: "555-123-4567",
        address: "789 Surgical Blvd, Curetown, USA",
        paymentTerms: "COD",
        deliveryTimeEstimate: "10-14 business days",
        status: "Inactive"
    },
    {
        vendorId: "VEND004",
        vendorName: "Global Health",
        contactPerson: "Susan Williams",
        email: "susan@globalhealth.com",
        phone: "555-987-6543",
        address: "101 Wellness Way, Lifeburg, USA",
        paymentTerms: "Net 30",
        deliveryTimeEstimate: "5-7 business days",
        status: "Active"
    }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        poNumber: "PO-2024-0001",
        vendorId: "VEND001",
        orderDate: new Date("2024-05-15"),
        expectedDate: new Date("2024-05-22"),
        items: [{ itemId: "ITM001", quantity: 500, receivedQuantity: 500 }],
        status: "Completed",
        notes: "Urgent restock for cardiology department."
    },
    {
        poNumber: "PO-2024-0002",
        vendorId: "VEND002",
        orderDate: new Date("2024-05-18"),
        expectedDate: new Date("2024-05-24"),
        items: [{ itemId: "ITM005", quantity: 100, receivedQuantity: 50 }],
        status: "Partially Received",
    },
    {
        poNumber: "PO-2024-0003",
        vendorId: "VEND004",
        orderDate: new Date(),
        expectedDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        items: [
            { itemId: "ITM004", quantity: 200, receivedQuantity: 0 },
            { itemId: "ITM007", quantity: 100, receivedQuantity: 0 },
        ],
        status: "Dispatched",
        notes: "Standard restock."
    },
    {
        poNumber: "PO-2024-0004",
        vendorId: "VEND001",
        orderDate: new Date(),
        items: [{ itemId: "ITM006", quantity: 1000, receivedQuantity: 0 }],
        status: "Pending"
    }
];

    