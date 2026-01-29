"use client";

import { Star, Gift, Users, Zap, ArrowUpRight, Plus, ShieldCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function VendorLoyaltyPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".loyalty-card", {
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
            <header className="flex flex-col gap-2">
                <h1 className="text-5xl font-black tracking-tighter uppercase">REWARDS CENTER</h1>
                <p className="text-white/40 font-medium">Configure loyalty tiers and launch exclusive shop offers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard title="Total Loyalty Members" value="1,204" trend="+42" icon={<Users className="w-5 h-5" />} />
                <StatCard title="Points Distributed" value="84.2k" trend="+12.4k" icon={<Star className="w-5 h-5" />} />
                <StatCard title="Reward Redemptions" value="156" trend="+18" icon={<Gift className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Tier Config */}
                <section className="loyalty-card bg-white/[0.03] border border-white/10 rounded-[48px] p-10 space-y-8">
                    <h3 className="text-2xl font-black tracking-tight uppercase">LOYALTY TIERS</h3>
                    <div className="space-y-4">
                        <TierRow name="Bronze" threshold="0 Points" cashback="1%" color="bg-orange-500" />
                        <TierRow name="Silver" threshold="5,000 Points" cashback="2%" color="bg-slate-400" />
                        <TierRow name="Gold" threshold="10,000 Points" cashback="5%" color="bg-primary" active />
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                        CUSTOMIZE REWARD FORMULAS
                    </button>
                </section>

                {/* Active Offers */}
                <section className="loyalty-card space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight uppercase">SECRET OFFERS</h3>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all">
                            <Plus className="w-5 h-5" /> CREATE OFFER
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-8 bg-primary text-black rounded-[40px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl -mr-16 -mt-16" />
                            <Zap className="w-8 h-8 mb-4 fill-black" />
                            <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">Early Bird Flash Sale</h4>
                            <p className="text-sm font-bold opacity-60 mb-6">Exclusive to GOLD members. 15% off all electronics for the next 24 hours.</p>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-black/10 rounded-lg text-[10px] font-black uppercase tracking-widest font-black italic">Targeting 412 Users</span>
                                <div className="h-1 bg-black/10 flex-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-black w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon }: any) {
    return (
        <div className="loyalty-card bg-white/[0.03] border border-white/10 p-8 rounded-[32px] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-primary/10 text-primary">
                    <ArrowUpRight className="w-3 h-3" /> {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function TierRow({ name, threshold, cashback, color, active }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-6 rounded-3xl transition-all",
            active ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5"
        )}>
            <div className="flex items-center gap-4">
                <div className={cn("w-3 h-3 rounded-full mb-0.5 shadow-[0_0_10px_rgba(0,0,0,0.5)]", color)} />
                <div>
                    <p className="font-bold text-lg">{name}</p>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{threshold}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">Cashback</p>
                <p className="text-xl font-black">{cashback}</p>
            </div>
        </div>
    );
}
