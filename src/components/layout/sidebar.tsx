
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  ShieldAlert,
  ShoppingCart,
  Thermometer,
  Truck,
  Building,
  FileText
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Archive, label: "Inventory" },
  { href: "/transfers", icon: Truck, label: "Transfers" },
  { href: "/fridge-monitor", icon: Thermometer, label: "Fridge Monitor" },
  { href: "/inspection", icon: ShieldAlert, label: "Inspection" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/drug-interaction", icon: FlaskConical, label: "Drug Interaction" },
];

const procurementItems = [
    { href: "/reorder-supplies", icon: ShoppingCart, label: "Create PO" },
    { href: "/purchase-orders", icon: FileText, label: "Purchase Orders" },
    { href: "/vendors", icon: Building, label: "Vendors" },
];


export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-16 flex-col border-r bg-card md:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <HeartPulse className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">MediChain</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-lg",
                      pathname.startsWith(item.href)
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )}
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
           <Tooltip>
              <TooltipTrigger asChild>
                 <div className="w-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-lg w-full",
                          procurementItems.some(i => pathname.startsWith(i.href))
                            ? "bg-muted text-primary"
                            : "text-muted-foreground"
                        )}
                        aria-label="Procurement"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                 </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-2">
                    <p className="font-semibold">Procurement</p>
                    {procurementItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm text-popover-foreground hover:text-primary">
                             <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
