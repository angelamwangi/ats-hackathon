"use client";

import { Truck, Phone, Mail, Package, ArrowRight, Plus, ExternalLink, ShieldCheck, Clock, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function SupplierPage() {
    const containerRef = useRef(null);
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const suppliers = useQuery(api.supplyChain.getSuppliers, vendor ? { vendorId: vendor._id } : "skip") || [];
    const registerSupplier = useMutation(api.supplyChain.registerSupplier);

    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        contactPhone: "",
        contactEmail: "",
        leadTimeDays: 3
    });

    useEffect(() => {
        if (containerRef.current && suppliers.length > 0) {
            gsap.from(".supplier-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
                clearProps: "all"
            });
        }
    }, [suppliers.length]);

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor) return;

        setIsSubmitting(true);
        try {
            await registerSupplier({
                vendorId: vendor._id,
                name: formData.name,
                category: formData.category,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                leadTimeDays: Number(formData.leadTimeDays)
            });
            setIsAdding(false);
            setFormData({ name: "", category: "", contactPhone: "", contactEmail: "", leadTimeDays: 3 });
        } catch (error) {
            console.error("Failed to add supplier:", error);
            alert("Failed to register supplier. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div ref={containerRef} className="space-y-12 pb-20 bg-black min-h-screen p-6">
            <header className="flex flex-col gap-2 md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase text-white">SUPPLIERS</h1>
                    <p className="text-zinc-300 font-medium mt-1">Coordinate restocks and manage wholesale relationships.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-[24px] hover:bg-zinc-200 transition-all shadow-2xl uppercase tracking-widest text-xs"
                >
                    <Plus className="w-5 h-5" /> REGISTER PARTNER
                </button>
            </header>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {suppliers.length === 0 ? (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-[48px] bg-zinc-900 shadow-inner">
                        <Truck className="w-16 h-16 text-zinc-800 mb-6" />
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-sm text-center">No active supply channels established</p>
                    </div>
                ) : (
                    suppliers.map((supplier) => (
                        <SupplierCard
                            key={supplier._id}
                            name={supplier.name}
                            contact={supplier.contactPhone || supplier.contactEmail}
                            category={supplier.category}
                            rating={((supplier.reliabilityScore || 100) / 20).toFixed(1)}
                            email={supplier.contactEmail}
                            phone={supplier.contactPhone}
                        />
                    ))
                )}
            </div>

            {/* Add Supplier Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border-2 border-zinc-800 rounded-[56px] p-12 max-w-xl w-full relative shadow-[0_0_100px_rgba(34,197,94,0.1)]">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-10 right-10 p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full hover:bg-zinc-800 hover:text-white transition-all hover:scale-110"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-4xl font-black uppercase italic mb-10 text-white">Register <span className="text-primary not-italic">Supplier</span></h2>

                        <form onSubmit={handleAddSupplier} className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Supplier Name</label>
                                <input
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white placeholder:text-zinc-800"
                                    placeholder="e.g. Nexus Logistics"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Distributor Category</label>
                                <input
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white placeholder:text-zinc-800"
                                    placeholder="e.g. Electronics"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Direct Mobile</label>
                                    <input
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white placeholder:text-zinc-800"
                                        placeholder="+254..."
                                        value={formData.contactPhone}
                                        onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-5 focus:outline-none focus:border-primary transition-all text-xl font-black text-white placeholder:text-zinc-800"
                                        placeholder="partner@nexus.com"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 bg-zinc-800 border-2 border-zinc-700 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-primary hover:text-black hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> ESTABLISHING LINK...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-6 h-6" /> Confirm Registration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SupplierCard({ name, contact, category, rating, email, phone }: any) {
    return (
        <div className="supplier-card bg-zinc-900 border-2 border-zinc-800 rounded-[48px] p-10 hover:border-primary/30 transition-all group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] -mr-16 -mt-16" />

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-20 h-20 bg-black border border-zinc-800 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <Truck className="w-10 h-10" />
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="px-4 py-1.5 bg-zinc-800 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> ONLINE
                    </div>
                    <div className="px-3 py-1 bg-zinc-800 text-yellow-500 rounded-xl text-[10px] font-black border border-zinc-700">
                        SCORE {rating} / 5.0
                    </div>
                </div>
            </div>

            <div className="mb-10 space-y-4 relative z-10">
                <h4 className="text-3xl font-black tracking-tighter uppercase text-white leading-tight">{name}</h4>
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Package className="w-3 h-3 text-primary" /> {category}
                    </p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Phone className="w-3 h-3 text-primary" /> {phone || "N/A"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <a href={`tel:${phone}`} className="py-4 bg-zinc-800 border border-zinc-700 text-white hover:bg-white hover:text-black hover:border-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                    <Phone className="w-4 h-4" /> CALL
                </a>
                <a href={`mailto:${email}`} className="py-4 bg-zinc-800 border border-zinc-700 text-white hover:bg-white hover:text-black hover:border-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                    <Mail className="w-4 h-4" /> EMAIL
                </a>
            </div>
        </div>
    );
}
