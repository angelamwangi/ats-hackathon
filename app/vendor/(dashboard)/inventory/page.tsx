"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Package, Edit, Trash, ArrowLeft, TrendingDown, Clock, AlertTriangle, Send, Zap, ShieldAlert, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useNexusDialog } from "@/components/providers/NexusDialogProvider";

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
    const generateUploadUrl = useMutation(api.products.generateUploadUrl);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        stock: 0,
        minStockThreshold: 5,
        category: "General",
        qualityRating: 5
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !vendor) return;

        setUploading(true);
        try {
            // Upload images first
            const imageStorageIds = await Promise.all(selectedFiles.map(async (file) => {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                const { storageId } = await result.json();
                return storageId;
            }));

            await addProduct({
                name: formData.name,
                price: formData.price,
                stock: formData.stock,
                minStockThreshold: formData.minStockThreshold,
                category: formData.category,
                qualityRating: formData.qualityRating,
                vendorId: vendor._id,
                images: imageStorageIds,
            });

            setIsAdding(false);
            setFormData({ name: "", price: 0, stock: 0, minStockThreshold: 5, category: "General", qualityRating: 5 });
            setSelectedFiles([]);
        } catch (error) {
            console.error("Failed to add product:", error);
            alert("Failed to upload images or create product.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <Link href="/vendor/pulse" className="flex items-center gap-2 text-white hover:text-primary transition-colors mb-6 text-[10px] font-black tracking-widest uppercase bg-zinc-900 px-4 py-2 border border-zinc-800 rounded-xl w-fit">
                            <ArrowLeft className="w-3 h-3" /> Dashboard
                        </Link>
                        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">SUPPLY <span className="text-primary not-italic">ENGINE</span></h1>
                        <p className="text-zinc-300 font-medium max-w-lg mt-4 text-sm">Predictive inventory forecasting and autonomous supplier coordination.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-3 px-8 py-5 bg-white text-black font-black rounded-[24px] hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs shadow-2xl"
                        >
                            <Plus className="w-5 h-5" /> Register SKU
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left: Global Supply Health */}
                    <div className="space-y-6">
                        <div className="p-8 bg-zinc-900 border border-zinc-700 rounded-[40px] shadow-xl">
                            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-8">Expiry Risk (30d)</h4>
                            <div className="space-y-4">
                                {expiryAlerts.length === 0 ? (
                                    <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-center">
                                        <p className="text-xs text-white font-black uppercase tracking-widest">No immediate risk</p>
                                    </div>
                                ) : (
                                    expiryAlerts.map((alert: any) => (
                                        <div key={alert._id} className="p-5 bg-orange-500 text-black border border-orange-400 rounded-2xl flex items-center justify-between shadow-lg">
                                            <div>
                                                <p className="font-black text-xs uppercase tracking-tight">{alert.batchId}</p>
                                                <p className="text-[10px] font-black uppercase text-zinc-800">{alert.daysUntilExpiry} days left</p>
                                            </div>
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-[40px] shadow-xl">
                            <Zap className="w-8 h-8 text-primary mb-6" />
                            <h4 className="font-black text-xs text-primary uppercase tracking-widest mb-3">Demand Forecast</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed font-bold uppercase tracking-tight">
                                AI is projecting a <span className="text-white">12% uptick</span> in "Electronics" over the next 14 days. Reordering recommended.
                            </p>
                        </div>
                    </div>

                    {/* Middle: Inventory Pulse Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {products.length === 0 ? (
                                <div className="md:col-span-2 h-[400px] flex flex-col items-center justify-center bg-zinc-900 rounded-[48px] border-2 border-dashed border-zinc-800 shadow-inner">
                                    <Package className="w-20 h-20 mb-6 text-zinc-800" />
                                    <p className="font-black uppercase tracking-widest text-sm text-zinc-600">Nexus Inventory Empty</p>
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
                    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100] p-4">
                        <form onSubmit={handleSubmit} className="bg-zinc-950 border-2 border-zinc-800 p-12 rounded-[56px] max-w-xl w-full relative shadow-2xl">
                            <button type="button" onClick={() => setIsAdding(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-all hover:scale-110">
                                <Plus className="w-8 h-8 rotate-45" />
                            </button>
                            <h2 className="text-4xl font-black uppercase italic mb-10 text-white">New <span className="text-primary not-italic">Acquisition</span></h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">SKU Identity / Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white placeholder:text-zinc-800"
                                        placeholder="e.g. Nexus Pro G-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Acquisition Price (KSh)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Initial Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Product Images</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-3xl cursor-pointer bg-zinc-900 hover:bg-zinc-800 hover:border-primary transition-all shadow-inner group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImagePlus className="w-10 h-10 mb-3 text-zinc-600 group-hover:text-primary transition-colors" />
                                                <p className="mb-2 text-sm text-zinc-500 font-bold uppercase tracking-tight"><span className="text-white">Click to upload</span> or drag and drop</p>
                                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">SVG, PNG, JPG (MAX 5MB)</p>
                                            </div>
                                            <input
                                                id="dropzone-file"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mt-6">
                                            {selectedFiles.map((file, i) => (
                                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-700 group shadow-md">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFiles(files => files.filter((_, idx) => idx !== i))}
                                                        className="absolute top-2 right-2 bg-black border border-zinc-700 p-1.5 rounded-full text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-6 bg-zinc-800 border-2 border-zinc-700 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            SYNCING ASSETS...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 fill-current" />
                                            Register to Engine
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div >
                )
                }
            </div >
        </div >
    );
}

function ProductPulseCard({ product }: { product: any }) {
    const forecast = useQuery(api.supplyChain.getDemandForecast, { productId: product._id });
    const suppliers = useQuery(api.supplyChain.getSuppliers, { vendorId: product.vendorId });
    const createPO = useMutation(api.supplyChain.generatePurchaseOrder);
    const sendPO = useAction(api.supplyChain.confirmAndSendPO);
    const { alert, prompt } = useNexusDialog();

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
                { opacity: 1, scaleX: Math.min(incomingQty / 50, 1 - (product.stock / 50)), transformOrigin: "left", duration: 1.5, ease: "expo.out", delay: 0.5 }
            );
        }
    }, [product.stock, forecast, incomingQty]);

    const handleReorder = async () => {
        if (!suppliers || suppliers.length === 0) {
            await alert("Missing Supplier", "No suppliers registered for this vendor. Please register a supplier first.");
            return;
        }

        const qty = await prompt(
            "Quick Reorder",
            `How many units of ${product.name} to reorder?`,
            "10"
        );
        if (!qty) return;

        try {
            const poId = await createPO({
                vendorId: product.vendorId,
                supplierId: suppliers[0]._id,
                items: [{ productId: product._id, quantity: parseInt(qty), expectedPrice: product.price * 0.8 }]
            });
            await sendPO({ poId });
            await alert("Order Sent", "Purchase Order generated and sent to supplier!");
        } catch (err) {
            console.error(err);
            await alert("Reorder Failed", "Failed to initiate reorder.");
        }
    };

    return (
        <div className="group bg-zinc-900 border border-zinc-700 p-10 rounded-[48px] hover:border-zinc-500 transition-all flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700 mb-2 inline-block">
                        {product.category}
                    </span>
                    <h3 className="font-black text-3xl uppercase tracking-tighter text-white">{product.name}</h3>
                </div>
                {forecast?.isAtRisk && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-black rounded-2xl animate-pulse shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">DEPLETION RISK</span>
                    </div>
                )}
            </div>

            <div className="relative h-4 bg-black border border-zinc-800 rounded-full overflow-hidden mb-10 shadow-inner">
                {/* Safety Stock Line */}
                <div
                    className="absolute top-0 bottom-0 border-l-2 border-zinc-600 z-20 pointer-events-none"
                    style={{ left: `${(product.minStockThreshold / 50) * 100}%` }}
                />

                <div
                    ref={barRef}
                    className={cn(
                        "h-full rounded-full transition-all relative z-10",
                        product.stock <= product.minStockThreshold ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-primary shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                    )}
                />
                {incomingQty > 0 && (
                    <div
                        ref={ghostRef}
                        className="absolute top-0 h-full bg-zinc-700 border-l border-zinc-500"
                        style={{ left: `${(product.stock / 50) * 100}%` }}
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-10 mt-auto relative z-10">
                <div className="p-4 bg-zinc-800 rounded-[24px] border border-zinc-700 shadow-md">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Current Pulse</p>
                    <p className="text-4xl font-black text-white">{product.stock}<span className="text-xs text-zinc-500 ml-2">SKU</span></p>
                </div>
                <div className="p-4 bg-zinc-800 rounded-[24px] border border-zinc-700 shadow-md text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Forecast (30d)</p>
                    <p className="text-4xl font-black text-white">{forecast?.forecast30Days || "..."}<span className="text-xs text-zinc-500 ml-2 italic">REQ</span></p>
                </div>
            </div>

            <div className="mt-10 flex items-center justify-between pt-8 border-t border-zinc-800 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                        <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                        {incomingQty > 0 ? `Incoming Stock: ${incomingQty}` : `Depletion: ${forecast?.daysUntilDepletion || "Inf"} Days`}
                    </span>
                </div>
                <button
                    onClick={handleReorder}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl"
                >
                    Initiate Reorder <Send className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
