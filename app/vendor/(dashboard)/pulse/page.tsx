"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Wallet,
    AlertCircle,
    ArrowUpRight,
    Zap,
    Package,
    Clock,
    Sparkles,
    Flame,
    Snowflake,
    Target,
    Store,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsumerInsights } from "@/components/vendor/ConsumerInsights";

export default function VendorPulsePage() {
    const { user } = useUser();
    const router = useRouter();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const getAIInsights = useAction(api.vendorAnalytics.getVendorAIInsights);

    const [aiInsights, setAiInsights] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".pulse-card",
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power3.out"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (vendor && !aiInsights && !loadingAI) {
            const fetchInsights = async () => {
                setLoadingAI(true);
                try {
                    const insights = await getAIInsights({ vendorId: vendor._id });
                    setAiInsights(insights);
                } catch (error) {
                    console.error("AI Insights Error:", error);
                } finally {
                    setLoadingAI(false);
                }
            };
            fetchInsights();
        }
    }, [vendor, getAIInsights, aiInsights, loadingAI]);

    const pulseMetrics = useQuery(api.vendorPulse.getPulseMetrics, vendor ? { vendorId: vendor._id } : "skip");

    const primaryColor = vendor?.brandConfig?.primaryColor || "#22c55e";

    return (
        <div ref={containerRef} className="space-y-12 pb-20 bg-black min-h-screen p-6">
            <header className="flex flex-col gap-2">
                <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit shadow-lg"
                    style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}40`, color: primaryColor }}
                >
                    <Zap className="w-3 h-3" style={{ fill: primaryColor }} /> MISSION CONTROL ACTIVE
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap text-white">
                    {vendor?.shopName || "VENDOR"} <span className="text-white">PULSE</span>
                </h1>
                <p className="text-white font-medium">Real-time shop analytics and AI-driven growth strategies.</p>
            </header>

            {vendor && !vendor.brandConfig && (
                <div className="pulse-card bg-zinc-900 border-2 border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <Palette className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-black uppercase text-lg tracking-tight text-white mb-1">Complete Your Brand Profile</h4>
                            <p className="text-sm text-zinc-300 font-medium">Set your brand colors and logo to customize your entire retail ecosystem.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/vendor/onboarding")}
                        className="px-8 py-4 bg-zinc-800 border border-zinc-700 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all whitespace-nowrap shadow-xl"
                    >
                        Setup Branding
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Sales"
                    value={`$${pulseMetrics?.todaysSales.toLocaleString() || "0"}`}
                    trend="--%"
                    icon={<TrendingUp className="w-5 h-5" />}
                    color={primaryColor}
                />
                <StatCard
                    title="Active BNPL"
                    value={pulseMetrics?.activeBnplCount.toString() || "0"}
                    trend="--"
                    icon={<Wallet className="w-5 h-5" />}
                    color={primaryColor}
                />
                <StatCard
                    title="Avg. Q-Rating"
                    value={pulseMetrics?.avgRating.toFixed(1) || "0.0"}
                    trend="--"
                    icon={<Zap className="w-5 h-5" />}
                    color={primaryColor}
                />
                <StatCard
                    title="Customer Traffic"
                    value={pulseMetrics?.todaysTraffic.toString() || "0"}
                    trend="today"
                    icon={<Users className="w-5 h-5" />}
                    color={primaryColor}
                />
            </div>

            {/* AI Strategy Room */}
            <section className="pulse-card bg-zinc-900 border border-zinc-700 rounded-[48px] overflow-hidden relative shadow-2xl">
                <div className="p-10 lg:p-14 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest bg-zinc-800 w-fit px-4 py-1.5 rounded-full border border-zinc-700">
                                <Sparkles className="w-4 h-4" /> AI STRATEGY ROOM
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Profit Maximizer Insights</h2>
                        </div>
                        <button
                            onClick={() => { setAiInsights(null); }}
                            className="px-8 py-4 bg-zinc-800 border border-zinc-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-3 shadow-lg"
                        >
                            {loadingAI ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Clock className="w-4 h-4" />}
                            Refresh Analysis
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Hot Sellers */}
                        <div className="space-y-6 p-8 bg-black border border-zinc-800 rounded-[32px] shadow-inner">
                            <div className="flex items-center gap-4 text-orange-500 mb-2">
                                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                                    <Flame className="w-7 h-7" />
                                </div>
                                <h4 className="font-black uppercase tracking-tighter text-lg text-white">Hot Sellers</h4>
                            </div>
                            {loadingAI ? (
                                <div className="h-32 flex items-center justify-center text-zinc-800"><Zap className="w-12 h-12 animate-bounce fill-current" /></div>
                            ) : (
                                <p className="text-sm text-zinc-300 leading-relaxed font-bold uppercase tracking-tight">
                                    {aiInsights?.hotSellers || "No data yet. Make some sales to reveal your top performers!"}
                                </p>
                            )}
                        </div>

                        {/* Dead Stock */}
                        <div className="space-y-6 p-8 bg-black border border-zinc-800 rounded-[32px] shadow-inner">
                            <div className="flex items-center gap-4 text-blue-400 mb-2">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <Snowflake className="w-7 h-7" />
                                </div>
                                <h4 className="font-black uppercase tracking-tighter text-lg text-white">Dead Stock</h4>
                            </div>
                            {loadingAI ? (
                                <div className="h-32 flex items-center justify-center text-zinc-800"><Zap className="w-12 h-12 animate-bounce fill-current" /></div>
                            ) : (
                                <p className="text-sm text-zinc-300 leading-relaxed font-bold uppercase tracking-tight">
                                    {aiInsights?.deadStock || "No stagnant inventory detected. Your flow is looking healthy."}
                                </p>
                            )}
                        </div>

                        {/* AI Strategy Points */}
                        <div className="space-y-6 lg:col-span-1">
                            <h4 className="font-black uppercase tracking-widest text-xs text-zinc-500 flex items-center gap-3 px-2">
                                <Target className="w-4 h-4" /> Recommended Strategies
                            </h4>
                            <div className="space-y-4">
                                {loadingAI ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-800 border border-zinc-700 rounded-2xl animate-pulse" />)
                                ) : (
                                    aiInsights?.strategy?.map((s: string, i: number) => (
                                        <div key={i} className="flex gap-4 p-5 bg-zinc-800 border border-zinc-700 rounded-2xl hover:border-primary/40 transition-all text-xs font-black leading-relaxed text-white shadow-md">
                                            <span className="text-primary font-black" style={{ color: primaryColor }}>{i + 1}.</span> {s.toUpperCase()}
                                        </div>
                                    )) || <div className="text-xs text-zinc-500 italic px-2">Awaiting more transaction data...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Consumer Behavior Analytics */}
            {vendor && (
                <section className="pulse-card">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-3xl flex items-center justify-center text-primary shadow-xl">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Consumer Insights</h2>
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
                                Real-time engagement analytics
                            </p>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-[40px] p-2 shadow-2xl">
                        <ConsumerInsights vendorId={vendor._id} />
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Critical Alerts */}
                <div className="pulse-card lg:col-span-2 bg-zinc-900 border border-zinc-700 rounded-[40px] p-10 shadow-2xl">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black tracking-tighter uppercase text-white">OPERATIONAL ALERTS</h3>
                        <span className="px-3 py-1.5 bg-red-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">LIVE MONITORING</span>
                    </div>

                    <div className="space-y-6">
                        <AlertRow
                            title="Inventory Check Required"
                            desc="The AI suggests verifying stock levels for your potential Hot Sellers."
                            type="market"
                            color={primaryColor}
                        />
                        <AlertRow
                            title="POS System Ready"
                            desc="Terminal is online and synced with the cloud."
                            type="stock"
                            color={primaryColor}
                        />
                    </div>
                </div>

                {/* Brand Identity Card */}
                <div className="pulse-card bg-zinc-900 border-2 border-primary/20 rounded-[48px] p-10 flex flex-col justify-between group relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] -mr-24 -mt-24" style={{ backgroundColor: `${primaryColor}10` }} />

                    <div>
                        <div className="w-20 h-20 bg-black border border-zinc-800 rounded-3xl flex items-center justify-center mb-8 overflow-hidden shadow-2xl">
                            {vendor?.logoUrl ? (
                                <img src={vendor.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Store className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter mb-3 uppercase text-white">{vendor?.shopName || "YOUR BRAND"}</h3>
                        <p className="text-sm font-black text-zinc-400 leading-tight uppercase tracking-tight">Identity verified and synced across the retail network.</p>
                    </div>

                    <div className="mt-10 space-y-4 pt-8 border-t border-zinc-800">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                            <span>Status Recovery Phase</span>
                            <span className="text-primary font-black italic">OPTIMIZED</span>
                        </div>
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 shadow-inner">
                            <div className="h-full bg-primary w-full shadow-[0_0_15px_rgba(34,197,94,0.4)]" style={{ backgroundColor: primaryColor }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }: any) {
    return (
        <div className="pulse-card bg-zinc-900 border border-zinc-700 p-8 rounded-[32px] hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="flex items-center justify-between mb-10">
                <div
                    className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-lg"
                >
                    <div className="transition-colors">{icon}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 shadow-sm" style={{ color: color }}>
                    <ArrowUpRight className="w-4 h-4" /> {trend.toUpperCase()}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
            </div>
        </div>
    );
}

function AlertRow({ title, desc, type, color }: any) {
    return (
        <div className="flex items-center gap-6 p-6 bg-zinc-800/50 border border-zinc-700 rounded-3xl hover:bg-zinc-800 hover:border-primary/30 transition-all group/row shadow-lg">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner",
                type === "stock" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    type === "payment" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-zinc-900 border-zinc-700 text-white"
            )} style={type === "market" ? { backgroundColor: `${color}10`, color: color, borderColor: `${color}20` } : {}}>
                <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="font-black text-lg text-white uppercase tracking-tight leading-none mb-1">{title}</p>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{desc}</p>
            </div>
            <button className="px-6 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black opacity-0 group-hover/row:opacity-100 transition-all shadow-xl">
                EXECUTE
            </button>
        </div>
    );
}
