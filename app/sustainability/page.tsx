"use client";

import { Leaf, Recycle, ShieldCheck, Heart, ArrowRight, TrendingUp, Globe, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function SustainabilityHubPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".eco-card",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 1,
                    ease: "power4.out"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
            <header className="mb-20">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                    <Leaf className="w-3 h-3" /> Circular Economy Hub
                </div>
                <h2 className="text-7xl font-black tracking-tighter mb-6 uppercase leading-none">SUSTAINABILITY<br />PLATFORM</h2>
                <p className="text-white max-w-2xl text-xl font-medium leading-relaxed">
                    Retail Nexus is committed to zero-waste commerce. Browse <span className="text-primary italic">Verified Pre-owned</span> goods, trade in old stock, and track your environmental impact.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                <ImpactCard
                    title="Carbon Offset"
                    value="12.4kg"
                    desc="Saved via Nexus local fulfillment"
                    icon={<Globe className="w-6 h-6" />}
                />
                <ImpactCard
                    title="Circle Credits"
                    value="840"
                    desc="Earned via verified trade-ins"
                    icon={<Recycle className="w-6 h-6" />}
                    isPrimary
                />
                <ImpactCard
                    title="Resale Score"
                    value="A+"
                    desc="Based on your purchase longevity"
                    icon={<Heart className="w-6 h-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="eco-card">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black tracking-tight uppercase">PASS-IT-ON: TRADE-INS</h3>
                        <button className="text-xs font-bold text-white hover:text-white transition-colors">START ASSESSMENT</button>
                    </div>
                    <div className="space-y-4">
                        <TradeInRow name="iPhone 13 Pro" value="$450.00" status="Eligible" />
                        <TradeInRow name="MacBook Air M1" value="$620.00" status="Verification Pending" />
                    </div>
                </section>

                <section className="eco-card bg-white/[0.03] border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                    <ShieldCheck className="w-12 h-12 text-primary mb-6" />
                    <h3 className="text-3xl font-black tracking-tight mb-4 uppercase">CERTIFIED PRE-OWNED</h3>
                    <p className="text-sm text-white leading-relaxed mb-8">
                        Every pre-owned item on Retail Nexus undergoes a 42-point inspection by local master technicians. High quality, lower impact.
                    </p>
                    <button className="flex items-center gap-2 group-hover:gap-4 transition-all text-sm font-black text-primary uppercase tracking-widest">
                        VIEW ECO-MARKETPLACE <ArrowRight className="w-4 h-4" />
                    </button>
                </section>
            </div>
        </div>
    );
}

function ImpactCard({ title, value, desc, icon, isPrimary }: any) {
    return (
        <div className={cn(
            "eco-card p-10 rounded-[48px] flex flex-col justify-between transition-all group",
            isPrimary ? "bg-primary text-black" : "bg-white/[0.03] border border-white/10"
        )}>
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                isPrimary ? "bg-black text-white" : "bg-white/5 text-white group-hover:bg-white group-hover:text-black"
            )}>
                {icon}
            </div>
            <div className="mt-12">
                <p className={cn("text-5xl font-black tracking-tighter mb-2", isPrimary ? "text-black" : "text-white")}>{value}</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 mb-1", isPrimary ? "text-black" : "text-white")}>{title}</p>
                <p className={cn("text-xs font-bold leading-tight", isPrimary ? "text-black/60" : "text-white")}>{desc}</p>
            </div>
        </div>
    );
}

function TradeInRow({ name, value, status }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-lg">{name}</p>
                    <p className="text-[10px] font-black text-white uppercase">{status}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-white uppercase mb-1">Estimated Credit</p>
                <p className="text-xl font-black">{value}</p>
            </div>
        </div>
    );
}

