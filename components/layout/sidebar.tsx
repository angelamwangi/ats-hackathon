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
    LogOut,
    ChevronRight
} from "lucide-react";
import { UserProfile } from "@/components/user-profile";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

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
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");

    const primaryColor = vendor?.brandConfig?.primaryColor || "#22c55e";

    return (
        <div className="w-80 h-screen bg-black border-r border-zinc-800 flex flex-col p-8 sticky top-0 overflow-y-auto no-scrollbar shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50">
            <div className="mb-14 px-2">
                <Link href="/vendor/pulse" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 rounded-[18px] flex items-center justify-center shrink-0 group-hover:border-primary transition-all duration-500 shadow-xl overflow-hidden">
                        {vendor?.logoUrl ? (
                            <img src={vendor.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 bg-white rounded-md rotate-45 group-hover:bg-primary transition-colors" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase text-white leading-tight">
                            {vendor?.shopName || "RETAIL NEXUS"}
                        </h1>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mt-1">Mission Control</p>
                    </div>
                </Link>
            </div>

            <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-4 ml-4">Management</p>
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-5 py-4 rounded-[20px] text-xs font-black transition-all group border shadow-sm",
                                isActive
                                    ? "bg-zinc-800 text-white border-zinc-700 translate-x-1 shadow-lg"
                                    : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "transition-all duration-300",
                                    isActive ? "text-primary scale-110" : "text-zinc-600 group-hover:text-primary group-hover:scale-110"
                                )}>
                                    {item.icon}
                                </div>
                                <span className="uppercase tracking-widest">{item.label}</span>
                            </div>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                isActive ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-transparent"
                            )} />
                        </Link>
                    );
                })}
            </div>

            <div className="mt-10 pt-10 border-t border-zinc-800">
                <div className="mb-6 px-2">
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Live</span>
                        </div>
                        <Settings className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                </div>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl">
                    <UserProfile />
                </div>
            </div>
        </div>
    );
}
