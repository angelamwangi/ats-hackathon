"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Store,
    ShoppingCart,
    ShieldCheck,
    Settings,
    Package,
    Users,
    CreditCard,
    LogOut
} from "lucide-react";
import { UserProfile } from "@/components/user-profile";

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

interface SidebarProps {
    items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="w-72 h-screen bg-black border-r border-white/5 flex flex-col p-6 sticky top-0 overflow-y-auto">
            <div className="mb-12 px-2">
                <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
                    </div>
                    RETAIL NEXUS
                </h1>
            </div>

            <div className="flex-1 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                                isActive
                                    ? "bg-white text-black"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "transition-transform group-hover:scale-110",
                                isActive ? "text-black" : "text-white/40 group-hover:text-white"
                            )}>
                                {item.icon}
                            </div>
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
                <UserProfile />
            </div>
        </div>
    );
}
