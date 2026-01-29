"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Wallet,
    CreditCard,
    Zap,
    TrendingUp,
    Gift,
    ChevronRight,
    Sparkles,
    Clock,
    ArrowRightLeft,
    ShieldCheck,
    Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ConsumerLoyaltyPage() {
    const { user, isLoaded } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const loyaltyCards = useQuery(api.loyalty.getUserLoyaltyCards, currentUser ? { userId: currentUser._id } : "skip");
    const bnplPlans = useQuery(api.bnpl.getMyPlans, currentUser ? { userId: currentUser._id } : "skip");

    // Calculate actual BNPL streak from plans
    const activePlans = bnplPlans?.filter((p: any) => p.status === "active") || [];
    const hasStreak = activePlans.length > 0;
    const streakWeeks = activePlans.length; // Each active plan counts as a week of streak

    const containerRef = useRef(null);

    useEffect(() => {
        if (!loyaltyCards) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".loyalty-card",
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power3.out",
                    overwrite: "auto"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loyaltyCards]);

    if (!isLoaded || !currentUser) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-12 pb-24">
            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                    <Wallet className="w-3 h-3" /> Digital Ecosystem Wallet
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
                    Your <span className="text-primary">WealthHub</span>
                </h1>
                <p className="text-white max-w-xl text-lg">
                    Manage your loyalty status, tracks your rewards, and unlock exclusive merchant drops.
                </p>
            </header>

            {/* Retention Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BNPL Streak Dopamine */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[32px] p-8">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                                <Flame className="w-4 h-4" /> {hasStreak ? `${streakWeeks}-PLAN${streakWeeks > 1 ? 'S' : ''} ACTIVE` : "NO ACTIVE STREAK"}
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">BNPL Power Boost</h3>
                            <p className="text-sm text-white max-w-[200px]">{hasStreak ? `Keep saving to unlock KSh ${streakWeeks * 50} progress bonus!` : "Start a Save-to-Buy plan to activate your streak!"}</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={cn("w-2 h-8 rounded-full transition-all", i <= streakWeeks ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-white/10")} />
                                ))}
                            </div>
                            <button onClick={() => window.location.href = '/consumer/bnpl'} className="text-[10px] font-black uppercase tracking-widest bg-orange-500 text-black px-4 py-2 rounded-lg hover:scale-105 transition-all">
                                {hasStreak ? "View Goals" : "Start Saving"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Predicted Restock */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[32px] p-8">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" /> SMART PREDICTION
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Run Low Reminder</h3>
                        <p className="text-sm text-white">You're likely 85% through your last coffee purchase. Restock now?</p>
                        <button className="w-full py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2 group">
                            Secure Restock <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loyalty Card Deck */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-primary" /> Verified Loyalty Cards
                    </h2>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{loyaltyCards?.length || 0} ACTIVE CARDS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loyaltyCards?.map((card: any) => {
                        const primColor = card.brandConfig?.primaryColor || "#22c55e";
                        return (
                            <div
                                key={card._id}
                                className="loyalty-card relative h-64 rounded-[32px] overflow-hidden group border border-white/5 bg-white/[0.03] transition-all hover:border-white/20"
                            >
                                {/* Card Brand Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all group-hover:opacity-40" style={{ backgroundColor: primColor }} />

                                <div className="p-8 flex flex-col justify-between h-full relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10 overflow-hidden">
                                                {card.logoUrl ? (
                                                    <img src={card.logoUrl} alt="logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-black uppercase text-sm tracking-tight">{card.vendorName}</h4>
                                                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> ID: {card._id.slice(-6)}
                                                </div>
                                            </div>
                                        </div>
                                        {card.tier && (
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase" style={{ color: primColor }}>
                                                {card.tier}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-white mb-1">Nexus Balance</div>
                                                <div className="text-3xl font-black tracking-tighter flex items-baseline gap-1">
                                                    {card.points} <span className="text-xs uppercase text-white">pts</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] font-black uppercase text-white mb-1">Next Reward</div>
                                                <div className="text-xs font-bold">5-Star Verification</div>
                                            </div>
                                        </div>

                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min((card.points / 1000) * 100, 100)}%`,
                                                    backgroundColor: primColor,
                                                    boxShadow: `0 0 10px ${primColor}50`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State / Discovery */}
                    <div className="loyalty-card h-64 rounded-[32px] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 space-y-4 hover:border-primary/40 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h4 className="font-black uppercase text-sm tracking-tight">Explore More Perks</h4>
                            <p className="text-xs text-white mt-1">Visit new verified shops to unlock loyalty status.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Circular Economy Engagement */}
            <section className="bg-white/[0.03] border border-white/10 rounded-[48px] p-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 max-w-lg">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                            <ArrowRightLeft className="w-4 h-4" /> CYCLE OF VALUE
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tight leading-none">
                            Guaranteed <span className="text-primary italic">Buy-Back</span> Cycle
                        </h2>
                        <p className="text-white text-lg leading-relaxed">
                            Every verified tech and appliance purchase comes with a dynamic trade-in quote. Turn your past upgrades into your next big asset.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm font-bold opacity-60">
                                <ShieldCheck className="w-5 h-5 text-primary" /> Locked trade-in value for 12 months
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold opacity-60">
                                <Zap className="w-5 h-5 text-primary" /> Instant credit in your Wallet
                            </li>
                        </ul>
                    </div>
                    <div className="w-64 h-64 rounded-full border border-white/5 p-4 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-2 border-primary/20 border-dashed rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="w-full h-full rounded-full bg-primary/10 flex flex-col items-center justify-center text-center p-8">
                            <TrendingUp className="w-8 h-8 text-primary mb-2" />
                            <div className="text-3xl font-black tracking-tighter">KSh {Math.floor((currentUser?.walletBalance || 0) * 0.8)}</div>
                            <div className="text-[10px] font-black uppercase text-primary tracking-widest">Wallet Balance</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

