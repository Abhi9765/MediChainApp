
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  Building,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Menu,
  ShieldAlert,
  ShoppingCart,
  Thermometer,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const mainNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/inventory", icon: Archive, label: "Inventory" },
    { href: "/transfers", icon: Truck, label: "Transfers" },
    { href: "/fridge-monitor", icon: Thermometer, label: "Fridge Monitor" },
    { href: "/inspection", icon: ShieldAlert, label: "Inspection" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/drug-interaction", icon: FlaskConical, label: "Drug Interaction" },
];

const procurementNavItems = [
    { href: "/reorder-supplies", icon: ShoppingCart, label: "Create PO" },
    { href: "/purchase-orders", icon: FileText, label: "Purchase Orders" },
    { href: "/vendors", icon: Building, label: "Vendors" },
];

const allNavItems = [...mainNavItems, ...procurementNavItems];

export function Header() {
  const pathname = usePathname();
  const pageTitle = allNavItems.find(item => pathname.startsWith(item.href))?.label || "MediChain";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="mb-4 flex items-center gap-2 text-lg font-semibold"
            >
              <HeartPulse className="h-6 w-6 text-primary" />
              <span>MediChain</span>
            </Link>
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                    pathname.startsWith(item.href) && "bg-muted text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="procurement" className="border-b-0">
                <AccordionTrigger className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-180">
                   <div className="flex items-center gap-4">
                     <ShoppingCart className="h-5 w-5" />
                     Procurement
                   </div>
                </AccordionTrigger>
                <AccordionContent className="ml-4">
                  {procurementNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "bg-muted text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        <h1 className="font-semibold text-xl">{pageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
