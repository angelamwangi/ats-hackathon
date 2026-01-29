"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ShoppingBag,
    Search,
    Heart,
    User,
    CreditCard,
    History,
    Store
} from "lucide-react";
import { UserProfile } from "@/components/user-profile";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
                        </div>
                        RETAIL NEXUS
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <NavLink href="/consumer/marketplace" active={pathname === "/consumer/marketplace"}>Marketplace</NavLink>
                        <NavLink href="/consumer/bnpl" active={pathname === "/consumer/bnpl"}>Save-to-Buy</NavLink>
                        <NavLink href="/consumer/orders" active={pathname === "/consumer/orders"}>My Orders</NavLink>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-white/40 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="text-white/40 hover:text-white transition-colors relative">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-black" />
                        </button>
                        <UserProfile />
                    </div>
                </div>
            </nav>

            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white/20 text-sm font-medium">© 2026 RETAIL NEXUS OS. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8 text-white/20 text-sm font-bold tracking-widest uppercase">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/support" className="hover:text-white transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "text-sm font-bold tracking-widest uppercase transition-colors",
                active ? "text-white" : "text-white/40 hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}
