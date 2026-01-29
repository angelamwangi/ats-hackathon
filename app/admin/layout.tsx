"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    ShieldCheck,
    Users,
    Store,
    Settings,
    Activity,
    CreditCard
} from "lucide-react";

const adminSidebarItems = [
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Platform Pulse", href: "/admin/dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "User Management", href: "/admin/users" },
    { icon: <Store className="w-5 h-5" />, label: "Vendor Approval", href: "/admin/vendors" },
    { icon: <Activity className="w-5 h-5" />, label: "System Health", href: "/admin/system" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Financial Escrow", href: "/admin/escrow" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout sidebarItems={adminSidebarItems}>
            {children}
        </DashboardLayout>
    );
}
