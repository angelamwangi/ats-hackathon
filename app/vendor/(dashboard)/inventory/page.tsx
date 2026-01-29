"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Package, Edit, Trash, ArrowLeft, TrendingDown, Clock, AlertTriangle, Send, Zap, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import gsap from "gsap";

export default function InventoryPage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");

    const products = useQuery(api.products.getProducts, vendor ? { vendorId: vendor._id } : "skip") || [];
    const addProduct = useMutation(api.products.addProduct);
    const getSuppliers = useQuery(api.supplyChain.getSuppliers, vendor ? { vendorId: vendor._id } : "skip") || [];
    const expiryAlerts = useQuery(api.supplyChain.getExpiryAlerts, vendor ? { vendorId: vendor._id } : "skip") || [];

    const [isAdding, setIsAdding] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        stock: 0,
        minStockThreshold: 5,
        category: "General",
        qualityRating: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !vendor) return;
        await addProduct({
            ...formData,
            vendorId: vendor._id,
            images: [],
        });
        setIsAdding(false);
        setFormData({ name: "", price: 0, stock: 0, minStockThreshold: 5, category: "General", qualityRating: 5 });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <Link href="/vendor/pulse" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 text-[10px] font-black tracking-widest uppercase">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-6xl font-black tracking-tighter uppercase italic">SUPPLY <span className="text-primary not-italic">ENGINE</span></h1>
                        <p className="text-white/40 font-medium max-w-lg mt-2">Predictive inventory forecasting and autonomous supplier coordination.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs"
                        >
                            <Plus className="w-4 h-4" /> Register SKU
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left: Global Supply Health */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px]">
                            <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-6">Expiry Risk (30d)</h4>
                            <div className="space-y-4">
                                {expiryAlerts.length === 0 ? (
                                    <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No immediate risk</p>
                                ) : (
                                    expiryAlerts.map((alert: any) => (
                                        <div key={alert._id} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-xs">{alert.batchId}</p>
                                                <p className="text-[10px] text-orange-500 font-black uppercase">{alert.daysUntilExpiry} days left</p>
                                            </div>
                                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-primary/10 border border-primary/20 rounded-[32px]">
                            <Zap className="w-6 h-6 text-primary mb-4" />
                            <h4 className="font-black text-xs text-primary uppercase tracking-widest mb-2">Demand Forecast</h4>
                            <p className="text-xs text-white/50 leading-relaxed font-medium">
                                AI is projecting a <span className="text-white font-black">12% uptick</span> in "Electronics" over the next 14 days. Reordering recommended.
                            </p>
                        </div>
                    </div>

                    {/* Middle: Inventory Pulse Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {products.length === 0 ? (
                                <div className="md:col-span-2 h-96 flex flex-col items-center justify-center opacity-20 bg-white/5 rounded-[40px] border border-dashed border-white/20">
                                    <Package className="w-16 h-16 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Nexus Inventory Empty</p>
                                </div>
                            ) : (
                                products.map((product: any) => (
                                    <ProductPulseCard key={product._id} product={product} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {isAdding && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[48px] max-w-lg w-full relative">
                            <button type="button" onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                            <h2 className="text-4xl font-black uppercase italic mb-8">New <span className="text-primary not-italic">Acquisition</span></h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">SKU Identity / Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 text-lg font-bold"
                                        placeholder="e.g. Nexus Pro G-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Acquisition Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 text-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Initial Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 text-lg font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[0.98] transition-all">Register to Engine</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductPulseCard({ product }: { product: any }) {
    const forecast = useQuery(api.supplyChain.getDemandForecast, { productId: product._id });
    const suppliers = useQuery(api.supplyChain.getSuppliers, { vendorId: product.vendorId });
    const createPO = useMutation(api.supplyChain.generatePurchaseOrder);
    const sendPO = useAction(api.supplyChain.confirmAndSendPO);

    const activePOs = useQuery(api.supplyChain.getActivePOsByVendor, { vendorId: product.vendorId }) || [];
    const incomingQty = activePOs
        .flatMap((po: any) => po.items)
        .filter((item: any) => item.productId === product._id)
        .reduce((acc: number, item: any) => acc + item.quantity, 0);

    const barRef = useRef(null);
    const ghostRef = useRef(null);

    useEffect(() => {
        if (!forecast) return;
        gsap.fromTo(barRef.current,
            { scaleX: 0 },
            { scaleX: Math.min(product.stock / 50, 1), transformOrigin: "left", duration: 1.5, ease: "expo.out" }
        );

        if (incomingQty > 0) {
            gsap.fromTo(ghostRef.current,
                { opacity: 0, scaleX: 0 },
                { opacity: 0.3, scaleX: Math.min(incomingQty / 50, 1 - (product.stock / 50)), transformOrigin: "left", duration: 1.5, ease: "expo.out", delay: 0.5 }
            );
        }
    }, [product.stock, forecast, incomingQty]);

    const handleReorder = async () => {
        if (!suppliers || suppliers.length === 0) {
            alert("No suppliers registered for this vendor. Please register a supplier first.");
            return;
        }

        const qty = prompt(`How many units of ${product.name} to reorder?`, "10");
        if (!qty) return;

        try {
            const poId = await createPO({
                vendorId: product.vendorId,
                supplierId: suppliers[0]._id,
                items: [{ productId: product._id, quantity: parseInt(qty), expectedPrice: product.price * 0.8 }]
            });
            await sendPO({ poId });
            alert("Purchase Order generated and sent to supplier!");
        } catch (err) {
            console.error(err);
            alert("Failed to initiate reorder.");
        }
    };

    return (
        <div className="group bg-white/[0.03] border border-white/10 rounded-[40px] p-8 hover:border-white/20 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{product.category}</span>
                    <h3 className="font-bold text-2xl uppercase tracking-tighter italic">{product.name}</h3>
                </div>
                {forecast?.isAtRisk && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase">DEPLETION RISK</span>
                    </div>
                )}
            </div>

            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                {/* Safety Stock Line */}
                <div
                    className="absolute top-0 bottom-0 border-l border-white/20 z-20 pointer-events-none"
                    style={{ left: `${(product.minStockThreshold / 50) * 100}%` }}
                />

                <div
                    ref={barRef}
                    className={cn(
                        "h-full rounded-full transition-all relative z-10",
                        product.stock <= product.minStockThreshold ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    )}
                />
                {incomingQty > 0 && (
                    <div
                        ref={ghostRef}
                        className="absolute top-0 h-full bg-primary/40 border-l border-dashed border-white/40"
                        style={{ left: `${(product.stock / 50) * 100}%` }}
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-auto">
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Pulse</p>
                    <p className="text-3xl font-black">{product.stock}<span className="text-xs text-white/20 ml-2">SKU</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Forecast (30d)</p>
                    <p className="text-3xl font-black text-white/60">{forecast?.forecast30Days || "..."}<span className="text-xs text-white/20 ml-2 italic">REQ</span></p>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] font-black text-white/20 uppercase">
                        {incomingQty > 0 ? `Incoming: ${incomingQty}` : `Remaining: ${forecast?.daysUntilDepletion || "Inf"} Days`}
                    </span>
                </div>
                <button
                    onClick={handleReorder}
                    className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
                >
                    Initiate Reorder <Send className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
