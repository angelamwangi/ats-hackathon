"use client";
import { Star, Gift, Users, Zap, ArrowUpRight, Plus, ShieldCheck, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function VendorLoyaltyPage() {
    const containerRef = useRef(null);
    const { user } = useUser();

    // 1. Get Convex User
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");

    // 2. Get Vendor
    const vendor = useQuery(api.vendors.getVendorByOwnerId,
        currentUser ? { ownerId: currentUser._id } : "skip"
    );

    // 3. Get Loyalty Metrics
    const metrics = useQuery(api.loyalty.getVendorLoyaltyMetrics,
        vendor ? { vendorId: vendor._id } : "skip"
    );

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
    }, [metrics]); // Re-run animation when metrics load

    if (!metrics) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-12 bg-black min-h-screen p-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-5xl font-black tracking-tighter uppercase text-white">REWARDS CENTER</h1>
                <p className="text-white font-medium">Configure loyalty tiers and launch exclusive shop offers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard
                    title="Total Loyalty Members"
                    value={metrics.totalMembers.toLocaleString()}
                    trend={metrics.trend}
                    icon={<Users className="w-5 h-5" />}
                />
                <StatCard
                    title="Points Distributed"
                    value={(metrics.totalPoints / 1000).toFixed(1) + "k"}
                    trend="+8%"
                    icon={<Star className="w-5 h-5" />}
                />
                <StatCard
                    title="Reward Redemptions"
                    value={metrics.redemptions.toString()}
                    trend="+5"
                    icon={<Gift className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Tier Config */}
                <section className="loyalty-card bg-zinc-900 border border-zinc-700 rounded-[48px] p-10 space-y-8 shadow-2xl">
                    <h3 className="text-2xl font-black tracking-tight uppercase text-white">LOYALTY TIERS</h3>
                    <div className="space-y-4">
                        <TierRow
                            name="Bronze"
                            threshold="0 Points"
                            cashback="1%"
                            color="bg-orange-500"
                            count={metrics.tierDistribution.bronze}
                        />
                        <TierRow
                            name="Silver"
                            threshold="5,000 Points"
                            cashback="2%"
                            color="bg-slate-400"
                            count={metrics.tierDistribution.silver}
                        />
                        <TierRow
                            name="Gold"
                            threshold="10,000 Points"
                            cashback="5%"
                            color="bg-primary"
                            active
                            count={metrics.tierDistribution.gold}
                        />
                    </div>
                    <button className="w-full py-4 bg-zinc-800 border border-zinc-700 font-black rounded-2xl text-[10px] uppercase tracking-widest text-white hover:bg-zinc-700 transition-all">
                        CUSTOMIZE REWARD FORMULAS
                    </button>
                </section>

                {/* Active Offers */}
                <section className="loyalty-card space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight uppercase text-white">SECRET OFFERS</h3>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-lg">
                            <Plus className="w-5 h-5" /> CREATE OFFER
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-8 bg-zinc-900 border border-zinc-700 text-white rounded-[40px] relative overflow-hidden group shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                            <Zap className="w-8 h-8 mb-4 fill-primary text-primary" />
                            <h4 className="text-2xl font-black tracking-tight mb-2 uppercase text-white">Early Bird Flash Sale</h4>
                            <p className="text-sm font-bold text-zinc-300 mb-6">Exclusive to GOLD members. 15% off all electronics for the next 24 hours.</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary italic">Targeting {metrics.tierDistribution.gold} Users</span>
                                    <span className="text-[10px] font-black text-white">45% ACTIVE</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                                    <div className="h-full bg-primary w-[45%]" />
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
        <div className="loyalty-card bg-zinc-900 border border-zinc-700 p-8 rounded-[32px] hover:border-primary/50 transition-all flex flex-col justify-between group shadow-lg">
            <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all">
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-zinc-800 text-primary border border-primary/20">
                    <ArrowUpRight className="w-3 h-3" /> {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tighter text-white">{value}</p>
            </div>
        </div>
    );
}

function TierRow({ name, threshold, cashback, color, active, count }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-6 rounded-3xl transition-all border",
            active ? "bg-zinc-800 border-primary/40 shadow-lg scale-[1.02]" : "bg-zinc-900 border-zinc-800"
        )}>
            <div className="flex items-center gap-4">
                <div className={cn("w-4 h-4 rounded-full mb-0.5 shadow-xl", color)} />
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-black text-lg text-white uppercase tracking-tight">{name}</p>
                        <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-black">{count} Users</span>
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{threshold}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Benefit</p>
                <p className="text-xl font-black text-white">{cashback} <span className="text-[10px] text-zinc-400">Back</span></p>
            </div>
        </div>
    );
}
