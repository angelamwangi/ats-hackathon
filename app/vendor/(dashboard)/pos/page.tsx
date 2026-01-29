"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSync } from "@/hooks/useSync";
import { localDB, LocalProduct } from "@/lib/sqlite/db";
import {
    ShoppingCart,
    Search,
    Wifi,
    WifiOff,
    Plus,
    Minus,
    Trash2,
    Package,
    LayoutDashboard,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function POSPage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const { isOnline, syncing } = useSync();
    const [products, setProducts] = useState<LocalProduct[]>([]);
    const [cart, setCart] = useState<{ product: LocalProduct; quantity: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("All");
    const [cartVisible, setCartVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load from local DB
    useEffect(() => {
        const load = async () => {
            const data = await localDB.getAllProducts();
            setProducts(data);
        };
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    const batches = useQuery(api.supplyChain.getExpiryAlerts, vendor ? { vendorId: vendor._id } : "skip") || [];

    const addToCart = (product: LocalProduct) => {
        // FIFO/Batch Intelligence Alert
        const soonExpiring = batches.find((b: any) => b.productId === product._id && b.daysUntilExpiry < 7);
        if (soonExpiring) {
            alert(`FIFO ALERT: Sell items from Batch ${soonExpiring.batchId} first. They expire in ${soonExpiring.daysUntilExpiry} days.`);
        }

        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });

        setCartVisible(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product._id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const initiateMpesa = useAction(api.payments.initiateMpesaStkPush);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa">("cash");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const checkout = async () => {
        if (cart.length === 0) return;

        if (paymentMethod === "mpesa" && isOnline) {
            if (!customerPhone || customerPhone.length < 10) {
                alert("Please enter a valid M-Pesa phone number (e.g., 254712345678)");
                return;
            }

            setIsPaying(true);
            try {
                const res = await initiateMpesa({ phoneNumber: customerPhone, amount: total });
                if (res.ResponseCode === "0") {
                    alert("STK Push sent! Customer should enter PIN on their phone...");
                } else {
                    alert("STK Push failed. Please try again or use cash.");
                    setIsPaying(false);
                    return;
                }
            } catch (err) {
                console.error(err);
                alert("Payment initiation error.");
                setIsPaying(false);
                return;
            }
        }

        const orderId = `pos_${Date.now()}`;

        if (!vendor) {
            alert("Vendor information not loaded. Please refresh and try again.");
            setIsPaying(false);
            return;
        }

        const vendorId = vendor._id;

        await localDB.saveOrder({
            id: orderId,
            vendorId: vendorId,
            items: cart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                priceAtSale: item.product.price
            })),
            totalAmount: total,
            status: 'pending',
            createdAt: Date.now()
        });

        const updatedProducts = products.map(p => {
            const cartItem = cart.find(c => c.product._id === p._id);
            if (cartItem) {
                return { ...p, stock: p.stock - cartItem.quantity };
            }
            return p;
        });
        await localDB.syncProducts(updatedProducts);
        setProducts(updatedProducts);

        setCart([]);
        setCustomerPhone("");
        setIsPaying(false);
        alert(isOnline ? "Sale completed & synced!" : "Offline sale saved. Will sync when back online.");
    };

    const filteredProducts = products.filter(p =>
        (category === "All" || p.category === category) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <div className="flex bg-transparent text-white font-sans h-screen overflow-hidden relative">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase">POINT OF SALE</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {mounted && (
                                <>
                                    {isOnline ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 uppercase tracking-widest">
                                            <Wifi className="w-3 h-3" /> Online
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-widest animate-pulse">
                                            <WifiOff className="w-3 h-3" /> Offline Mode
                                        </span>
                                    )}
                                    {syncing && <span className="text-[10px] text-white/40 animate-spin">⟳</span>}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 w-72 transition-all font-medium"
                            />
                        </div>

                        <button
                            onClick={() => setCartVisible(!cartVisible)}
                            className={cn(
                                "relative px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2",
                                cartVisible ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                            )}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center text-xs font-black">
                                    {cart.length}
                                </span>
                            )}
                            {cartVisible ? "HIDE" : "CART"}
                        </button>
                    </div>
                </header>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none flex-shrink-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                category === cat
                                    ? "bg-white text-black scale-105"
                                    : "bg-white/5 text-white/50 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid - Full Height */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Package className="w-24 h-24 mb-6" />
                            <p className="text-2xl font-black uppercase tracking-widest">No products found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 pb-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="group relative flex flex-col p-6 bg-white/5 border-2 border-white/10 rounded-3xl hover:border-primary hover:bg-white/[0.08] hover:scale-105 transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 h-full min-h-[180px]"
                                >
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">
                                            {product.category}
                                        </span>
                                        <h3 className="font-black text-xl leading-tight mb-3 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-3xl font-black text-primary">${product.price}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className={cn(
                                            "text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider",
                                            product.stock > 10
                                                ? "bg-green-500/20 text-green-400"
                                                : product.stock > 0
                                                    ? "bg-orange-500/20 text-orange-400"
                                                    : "bg-red-500/20 text-red-400"
                                        )}>
                                            {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                                            <Plus className="w-5 h-5 text-primary group-hover:text-black" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Sheet - Overlay */}
            {cartVisible && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                        onClick={() => setCartVisible(false)}
                    />

                    {/* Cart Sheet */}
                    <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-[#0a0a0a]/95 backdrop-blur-xl border-l-2 border-white/10 flex flex-col p-6 z-50 animate-in slide-in-from-right duration-300 shadow-2xl">
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                                <ShoppingCart className="w-6 h-6" /> CART
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest">
                                    {cart.length} ITEMS
                                </span>
                                <button
                                    onClick={() => setCartVisible(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                                    <ShoppingCart className="w-16 h-16 mb-4" />
                                    <p className="font-black text-lg uppercase tracking-widest">Cart is empty</p>
                                    <p className="text-sm text-white/40 mt-2">Add items to get started</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product._id} className="p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-4 hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-black text-base mb-1">{item.product.name}</h4>
                                                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                                                    ${item.product.price} / unit
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.product._id)}
                                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, -1)}
                                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-black text-lg w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, 1)}
                                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="font-black text-xl text-primary">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t-2 border-white/10 flex-shrink-0">
                            <div className="flex justify-between items-center mb-5">
                                <span className="text-white/40 font-bold tracking-widest text-xs uppercase">Payment Method</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMethod("cash")}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all",
                                            paymentMethod === "cash" ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/10"
                                        )}
                                    >
                                        Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("mpesa")}
                                        disabled={!isOnline}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2",
                                            paymentMethod === "mpesa" ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:bg-white/10",
                                            !isOnline && "opacity-20 grayscale pointer-events-none"
                                        )}
                                    >
                                        M-Pesa
                                    </button>
                                </div>
                            </div>

                            {/* M-Pesa Phone Input */}
                            {paymentMethod === "mpesa" && (
                                <div className="mb-5 animate-in text-white! slide-in-from-top duration-300">
                                    <label className="block text-white font-bold tracking-widest text-xs uppercase mb-2">
                                        Customer M-Pesa Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="254712345678"
                                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white font-bold placeholder:text-white/20 focus:border-primary focus:outline-none transition-all"
                                        maxLength={12}
                                    />
                                    <p className="text-xs text-white mt-2 font-medium">
                                        Customer will receive a prompt to enter their PIN
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6 p-4 bg-white/5 rounded-2xl">
                                <span className="text-white/60 font-black tracking-widest text-sm uppercase">Total</span>
                                <span className="text-4xl font-black text-primary">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={checkout}
                                disabled={cart.length === 0 || isPaying}
                                className={cn(
                                    "w-full py-5 font-black text-lg uppercase tracking-widest rounded-2xl active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-2xl",
                                    paymentMethod === "mpesa"
                                        ? "text-black bg-white"
                                        : "text-white bg-primary"
                                )}
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        AWAITING PAYMENT...
                                    </>
                                ) : (
                                    <>COMPLETE SALE</>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
