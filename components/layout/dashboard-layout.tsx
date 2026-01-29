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
        <div className="flex bg-black min-h-screen text-white selection:bg-primary selection:text-black">
            <Sidebar items={sidebarItems} />
            <main className="flex-1 overflow-y-auto no-scrollbar relative">
                {/* Fixed Background Elements */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[1000px] h-[600px] bg-zinc-900/20 blur-[150px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
                </div>

                <div className="relative p-10 lg:p-14 max-w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
