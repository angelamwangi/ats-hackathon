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
    Store,
    X
} from "lucide-react";
import { UserProfile } from "@/components/user-profile";
import { useState } from "react";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

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
                        <NavLink href="/consumer/loyalty" active={pathname === "/consumer/loyalty"}>WealthHub</NavLink>
                        <NavLink href="/consumer/orders" active={pathname === "/consumer/orders"}>My Orders</NavLink>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-white hover:text-white transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCartOpen(true)}
                            className="text-white hover:text-white transition-colors relative"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-black" />
                        </button>
                        <UserProfile />
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center pt-32 px-4">
                    <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-[32px] p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black uppercase">Search Products</h3>
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                            <input
                                type="text"
                                placeholder="Search for products, vendors..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg font-medium outline-none focus:border-primary transition-colors text-white placeholder:text-white"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-white text-center mt-4 font-bold uppercase">Press ESC to close</p>
                    </div>
                </div>
            )}

            {/* Cart Sidebar */}
            {cartOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                        onClick={() => setCartOpen(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-[#111] border-l border-white/10 animate-in slide-in-from-right duration-300">
                        <div className="p-8 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black uppercase">Your Cart</h3>
                                <button
                                    onClick={() => setCartOpen(false)}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                        <ShoppingBag className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase tracking-wide">Cart is Empty</p>
                                        <p className="text-sm text-white mt-1">Add items from the marketplace</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCartOpen(false);
                                            window.location.href = '/consumer/marketplace';
                                        }}
                                        className="px-6 py-3 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all uppercase text-sm"
                                    >
                                        Browse Marketplace
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white text-sm font-medium">© 2026 RETAIL NEXUS OS. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8 text-white text-sm font-bold tracking-widest uppercase">
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
                active ? "text-white" : "text-white hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}

