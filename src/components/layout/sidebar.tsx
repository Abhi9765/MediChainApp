"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart3,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  ShoppingCart,
  Thermometer,
  Truck,
  History
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Archive, label: "Inventory" },
  { href: "/stock-transfer", icon: Truck, label: "Stock Transfer" },
  { href: "/transfers", icon: History, label: "Transfers" },
  { href: "/fridge-monitor", icon: Thermometer, label: "Fridge Monitor" },
  { href: "/reorder-supplies", icon: ShoppingCart, label: "Reorder Supplies" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/drug-interaction", icon: FlaskConical, label: "Drug Interaction" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-16 flex-col border-r bg-card md:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="#"
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
        </TooltipProvider>
      </nav>
    </aside>
  );
}
