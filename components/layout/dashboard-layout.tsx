"use client";

import { Sidebar } from "./sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
    sidebarItems: {
        icon: React.ReactNode;
        label: string;
        href: string;
    }[];
}

export function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
    return (
        <div className="flex bg-[#050505] min-h-screen text-white selection:bg-primary/30">
            <Sidebar items={sidebarItems} />
            <main className="flex-1 overflow-y-auto">
                <div className="relative p-8 lg:p-12 max-w-7xl mx-auto">
                    {/* Subtle background glow */}
                    <div className="fixed top-0 right-0 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                    {children}
                </div>
            </main>
        </div>
    );
}
