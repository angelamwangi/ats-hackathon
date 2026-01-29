"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSync } from "@/hooks/useSync";
import { localDB, LocalProduct, LocalOrder } from "@/lib/sqlite/db";
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
    X,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useNexusDialog } from "@/components/providers/NexusDialogProvider";

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
    const { alert, confirm } = useNexusDialog();

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
            alert("FIFO ALERT", `Sell items from Batch ${soonExpiring.batchId} first. They expire in ${soonExpiring.daysUntilExpiry} days.`);
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
    const createOrder = useMutation(api.orders.createOrder);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa">("cash");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const checkout = async () => {
        if (cart.length === 0) return;

        if (paymentMethod === "mpesa" && isOnline) {
            if (!customerPhone || customerPhone.length < 10) {
                await alert("Missing Information", "Please enter a valid M-Pesa phone number.");
                return;
            }

            setIsPaying(true);
            try {
                const res = await initiateMpesa({ phoneNumber: customerPhone, amount: total });
                if (res.ResponseCode === "0") {
                    await alert("STK Push Sent", "Please check your phone to authorize the transaction.");

                    // Create pending order in Convex immediately if online
                    if (vendor) {
                        await createOrder({
                            vendorId: vendor._id as any,
                            items: cart.map(c => ({
                                productId: c.product._id as any,
                                quantity: c.quantity,
                                priceAtSale: c.product.price
                            })),
                            totalAmount: total,
                            source: "pos",
                            paymentMethod: "mpesa",
                            mpesaCheckoutId: res.CheckoutRequestID
                        });
                    }

                    // Clear cart and reset state
                    setCart([]);
                    setCustomerPhone("");
                    setIsPaying(false);
                    return;
                } else {
                    await alert("Payment Failed", "STK Push could not be initiated. Please try again or use cash.");
                    setIsPaying(false);
                    return;
                }
            } catch (err) {
                console.error(err);
                await alert("Error", "Critical error during payment initiation.");
                setIsPaying(false);
                return;
            }
        }

        if (!vendor) {
            await alert("System Error", "Vendor information not loaded. Please refresh.");
            setIsPaying(false);
            return;
        }
        // Save to local DB (indexedDB) for offline support
        const order: LocalOrder = {
            id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            vendorId: vendor._id,
            items: cart.map(c => ({
                productId: c.product._id,
                quantity: c.quantity,
                priceAtSale: c.product.price
            })),
            totalAmount: total,
            status: 'pending',
            paymentMethod: paymentMethod,
            createdAt: Date.now()
        };
        await localDB.saveOrder(order);

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
        await alert(
            isOnline ? "Sale Synchronized" : "Offline Sale Saved",
            isOnline ? "The transaction has been published to the cloud." : "Sale recorded locally. It will sync automatically when back online."
        );
    };

    const filteredProducts = products.filter(p =>
        (category === "All" || p.category === category) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <div className="flex bg-black text-white font-sans h-screen overflow-hidden relative p-6">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col mr-6">
                <header className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase text-white">POINT OF SALE</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {mounted && (
                                <>
                                    {isOnline ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                                            <Wifi className="w-3 h-3" /> Online
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-widest animate-pulse bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                                            <WifiOff className="w-3 h-3" /> Offline Mode
                                        </span>
                                    )}
                                    {syncing && <span className="text-[10px] text-white animate-spin ml-2">⟳ Syncing</span>}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl focus:outline-none focus:border-primary w-72 transition-all font-medium text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <button
                            onClick={() => setCartVisible(!cartVisible)}
                            className={cn(
                                "relative px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg",
                                cartVisible ? "bg-white text-black border-white" : "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                            )}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center text-xs font-black border-2 border-black">
                                    {cart.length}
                                </span>
                            )}
                            {cartVisible ? "HIDE" : "CART"}
                        </button>
                    </div>
                </header>

                {/* Categories */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm",
                                category === cat
                                    ? "bg-white text-black border-white scale-105"
                                    : "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid - Full Height */}
                <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                    {filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                            <Package className="w-24 h-24 mb-6" />
                            <p className="text-2xl font-black uppercase tracking-widest">No products found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 pb-6 grid-cols-2 md:grid-cols-3">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="group relative flex flex-col p-5 bg-zinc-900 border-2 border-zinc-800 rounded-[32px] hover:border-primary hover:bg-zinc-800 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed h-full shadow-xl"
                                >
                                    <div className="relative aspect-square w-full mb-4 bg-black rounded-2xl overflow-hidden border border-zinc-800">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                <Package className="w-12 h-12 text-zinc-600" />
                                            </div>
                                        )}
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-black flex items-center justify-center">
                                                <span className="font-black text-white text-xs uppercase tracking-widest border-2 border-white px-2 py-1">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                                            {product.category}
                                        </span>
                                        <h3 className="font-black text-xl leading-tight mb-3 text-white group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-3xl font-black text-primary">KSh {Math.floor(product.price)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                                        <span className={cn(
                                            "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border",
                                            product.stock > 10
                                                ? "bg-green-500 text-black border-green-400"
                                                : product.stock > 0
                                                    ? "bg-orange-500 text-black border-orange-400"
                                                    : "bg-red-500 text-black border-red-400"
                                        )}>
                                            {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-md">
                                            <Plus className="w-5 h-5 text-white group-hover:text-black" />
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
                        className="fixed inset-0 bg-black z-40"
                        onClick={() => setCartVisible(false)}
                    />

                    {/* Cart Sheet */}
                    <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-zinc-950 border-l-2 border-zinc-800 flex flex-col p-8 z-50 animate-in slide-in-from-right duration-400 shadow-2xl">
                        <div className="flex items-center justify-between mb-10 flex-shrink-0">
                            <h2 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter text-white">
                                <ShoppingCart className="w-8 h-8 text-primary" /> SHOPPING CART
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                                    {cart.length} ITEMS
                                </span>
                                <button
                                    onClick={() => setCartVisible(false)}
                                    className="p-3 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 rounded-xl transition-all hover:scale-110"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-900 text-center">
                                    <ShoppingCart className="w-24 h-24 mb-6" />
                                    <p className="font-black text-2xl uppercase tracking-widest">Cart is empty</p>
                                    <p className="text-sm text-zinc-500 mt-2 font-medium">Add items to get started</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product._id} className="p-6 bg-zinc-900 rounded-[32px] border border-zinc-700 flex gap-6 hover:border-zinc-500 transition-all items-start shadow-xl">
                                        <div className="w-24 h-24 rounded-2xl border border-zinc-800 bg-black overflow-hidden flex-shrink-0">
                                            {item.product.images && item.product.images[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                    <Package className="w-10 h-10 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-black text-lg text-white mb-1 uppercase tracking-tight">{item.product.name}</h4>
                                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                                        KSh {Math.floor(item.product.price)} / unit
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product._id)}
                                                    className="p-3 bg-zinc-800 border border-zinc-700 text-white hover:text-red-500 hover:border-red-900 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-2xl p-1.5 shadow-inner">
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, -1)}
                                                        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-black text-xl w-8 text-center text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, 1)}
                                                        className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="font-black text-2xl text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                                    KSh {Math.floor(item.product.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-10 p-8 bg-zinc-900 border-2 border-zinc-800 rounded-[40px] flex-shrink-0 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-zinc-400 font-black tracking-widest text-[10px] uppercase">Payment Method</span>
                                <div className="flex gap-2 p-1 bg-zinc-800 rounded-2xl border border-zinc-700">
                                    <button
                                        onClick={() => setPaymentMethod("cash")}
                                        className={cn(
                                            "px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
                                            paymentMethod === "cash" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("mpesa")}
                                        disabled={!isOnline}
                                        className={cn(
                                            "px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2",
                                            paymentMethod === "mpesa" ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white",
                                            !isOnline && "text-zinc-800 grayscale pointer-events-none"
                                        )}
                                    >
                                        M-Pesa
                                    </button>
                                </div>
                            </div>

                            {/* M-Pesa Phone Input */}
                            {paymentMethod === "mpesa" && (
                                <div className="mb-8 p-6 bg-zinc-800 border border-zinc-700 rounded-3xl animate-in slide-in-from-top duration-300">
                                    <label className="block text-zinc-400 font-black tracking-widest text-[10px] uppercase mb-3">
                                        Customer M-Pesa Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="254712345678"
                                        className="w-full px-5 py-4 bg-zinc-900 border-2 border-zinc-700 rounded-2xl text-white font-black placeholder:text-zinc-700 focus:border-primary focus:outline-none transition-all text-xl"
                                        maxLength={12}
                                    />
                                    <p className="text-[10px] text-zinc-500 mt-3 font-black uppercase tracking-widest">
                                        PIN request will be sent to handset
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-8 px-2">
                                <span className="text-zinc-400 font-black tracking-widest text-sm uppercase">Total Payable</span>
                                <span className="text-5xl font-black text-primary tracking-tighter">KSh {Math.floor(total).toLocaleString()}</span>
                            </div>

                            <button
                                onClick={checkout}
                                disabled={cart.length === 0 || isPaying}
                                className={cn(
                                    "w-full py-6 font-black text-xl uppercase tracking-widest rounded-3xl active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-4 border shadow-2xl",
                                    paymentMethod === "mpesa"
                                        ? "text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                                        : "text-white bg-zinc-800 border-zinc-700 hover:bg-primary hover:text-black hover:border-primary disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-zinc-800"
                                )}
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                        AWAITING PIN...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-6 h-6 fill-current" />
                                        COMPLETE SALE
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
