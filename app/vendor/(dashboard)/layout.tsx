"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    ShoppingCart,
    LayoutDashboard,
    Store,
    Settings,
    Package,
    History,
    BarChart3,
    Truck,
    Gift,
    Target,
} from "lucide-react";

const vendorSidebarItems = [
    { icon: <ShoppingCart className="w-5 h-5" />, label: "Point of Sale", href: "/vendor/pos" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics", href: "/vendor/analytics" },
    { icon: <Package className="w-5 h-5" />, label: "Inventory", href: "/vendor/inventory" },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Vendor Pulse", href: "/vendor/pulse" },
    { icon: <Target className="w-5 h-5" />, label: "Intelligence", href: "/vendor/intelligence" },
    { icon: <Truck className="w-5 h-5" />, label: "Suppliers", href: "/vendor/suppliers" },
    { icon: <Gift className="w-5 h-5" />, label: "Loyalty", href: "/vendor/loyalty" },
    { icon: <History className="w-5 h-5" />, label: "Order History", href: "/vendor/orders" },
    { icon: <Settings className="w-5 h-5" />, label: "Store Settings", href: "/vendor/settings" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout sidebarItems={vendorSidebarItems}>
            {children}
        </DashboardLayout>
    );
}
