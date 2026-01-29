"use client";

import { Truck, Phone, Mail, Package, ArrowRight, Plus, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function SupplierPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".supplier-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, []);

    return (
        <div ref={containerRef} className="space-y-12">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase">SUPPLIERS</h1>
                    <p className="text-white/40 font-medium">Coordinate restocks and manage wholesale relationships.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all">
                    <Plus className="w-5 h-5" /> ADD SUPPLIER
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SupplierCard
                    name="Nexus Logistics Hub"
                    contact="Primary Distributor"
                    category="Electronics"
                    rating={4.9}
                    isVerified
                />
                <SupplierCard
                    name="Direct Harvest Co."
                    contact="Bulk Groceries"
                    category="FMCG"
                    rating={4.7}
                    isVerified
                />
                <SupplierCard
                    name="Urban Style Wholesale"
                    contact="Fashion & Textiles"
                    category="Apparel"
                    rating={4.2}
                />
            </div>

            <section className="supplier-card bg-white/[0.03] border border-white/10 rounded-[40px] p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight uppercase">PENDING RESTOCK ORDERS</h3>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic animate-pulse">Checking Inventory Thresholds...</span>
                </div>

                <div className="space-y-4">
                    <RestockRow item="MacBook Air M2" qty={10} supplier="Nexus Logistics Hub" total="$10,200" status="Draft" />
                    <RestockRow item="Sony WH-1000XM5" qty={5} supplier="Nexus Logistics Hub" total="$1,240" status="Awaiting Approval" />
                </div>
            </section>
        </div>
    );
}

function SupplierCard({ name, contact, category, rating, isVerified }: any) {
    return (
        <div className="supplier-card bg-white/[0.03] border border-white/10 rounded-[32px] p-8 hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <Truck className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isVerified && (
                        <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> Nexus Verified
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-black">
                        ⭐️ {rating}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h4 className="text-2xl font-black tracking-tight mb-1 uppercase">{name}</h4>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">{contact} • {category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Phone className="w-3 h-3" /> CALL
                </button>
                <button className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                    <Mail className="w-3 h-3" /> EMAIL
                </button>
            </div>
        </div>
    );
}

function RestockRow({ item, qty, supplier, total, status }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-lg">{item}</p>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Order Amount: {qty} Units • {supplier}</p>
                </div>
            </div>
            <div className="flex items-center gap-12 text-right">
                <div className="hidden md:block">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Total Quote</p>
                    <p className="text-sm font-black">{total}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-60">{status}</span>
                    <button className="p-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
