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

    const primaryColor = vendor?.brandConfig?.primaryColor || "#22c55e";

    return (
        <div ref={containerRef} className="space-y-12 pb-20">
            <header className="flex flex-col gap-2">
                <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit animate-pulse"
                    style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}40`, color: primaryColor }}
                >
                    <Zap className="w-3 h-3" style={{ fill: primaryColor }} /> MISSION CONTROL ACTIVE
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap">
                    {vendor?.shopName || "VENDOR"} <span className="text-white/20">PULSE</span>
                </h1>
                <p className="text-white/40 font-medium">Real-time shop analytics and AI-driven growth strategies.</p>
            </header>

            {vendor && !vendor.brandConfig && (
                <div className="pulse-card bg-primary/10 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black uppercase text-sm tracking-tight text-primary">Complete Your Brand Profile</h4>
                            <p className="text-xs text-white/60">Set your brand colors and logo to customize your entire retail ecosystem.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/vendor/onboarding")}
                        className="px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all whitespace-nowrap"
                    >
                        Setup Branding
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Sales" value="$0" trend="0%" icon={<TrendingUp className="w-5 h-5" />} color={primaryColor} />
                <StatCard title="Active BNPL" value="0" trend="0" icon={<Wallet className="w-5 h-5" />} color={primaryColor} />
                <StatCard title="Avg. Q-Rating" value="0.0" trend="0.0" icon={<Zap className="w-5 h-5" />} color={primaryColor} />
                <StatCard title="Customer Traffic" value="0" trend="0%" icon={<Users className="w-5 h-5" />} color={primaryColor} />
            </div>

            {/* AI Strategy Room */}
            <section className="pulse-card bg-white/[0.03] border border-white/10 rounded-[48px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] opacity-10 transition-all duration-1000 group-hover:opacity-20" style={{ backgroundColor: primaryColor }} />

                <div className="p-8 lg:p-12 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest" style={{ color: primaryColor }}>
                                <Sparkles className="w-4 h-4" /> AI STRATEGY ROOM
                            </div>
                            <h2 className="text-4xl font-black tracking-tight uppercase">Profit Maximizer Insights</h2>
                        </div>
                        <button
                            onClick={() => { setAiInsights(null); }}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            {loadingAI ? <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin" /> : <Clock className="w-4 h-4" />}
                            Refresh Analysis
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Hot Sellers */}
                        <div className="space-y-4 p-8 bg-black/40 border border-white/5 rounded-3xl">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <Flame className="w-6 h-6" />
                                <h4 className="font-black uppercase tracking-widest text-sm">Hot Sellers</h4>
                            </div>
                            {loadingAI ? (
                                <div className="h-20 flex items-center justify-center opacity-20"><Zap className="w-8 h-8 animate-bounce" /></div>
                            ) : (
                                <p className="text-sm text-white/60 leading-relaxed font-medium">
                                    {aiInsights?.hotSellers || "No data yet. Make some sales to reveal your top performers!"}
                                </p>
                            )}
                        </div>

                        {/* Dead Stock */}
                        <div className="space-y-4 p-8 bg-black/40 border border-white/5 rounded-3xl">
                            <div className="flex items-center gap-3 text-blue-400 mb-2">
                                <Snowflake className="w-6 h-6" />
                                <h4 className="font-black uppercase tracking-widest text-sm">Dead Stock</h4>
                            </div>
                            {loadingAI ? (
                                <div className="h-20 flex items-center justify-center opacity-20"><Zap className="w-8 h-8 animate-bounce" /></div>
                            ) : (
                                <p className="text-sm text-white/60 leading-relaxed font-medium">
                                    {aiInsights?.deadStock || "No stagnant inventory detected. Your flow is looking healthy."}
                                </p>
                            )}
                        </div>

                        {/* AI Strategy Points */}
                        <div className="space-y-6 lg:col-span-1">
                            <h4 className="font-black uppercase tracking-widest text-xs text-white/40 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Recommended Strategies
                            </h4>
                            <div className="space-y-3">
                                {loadingAI ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)
                                ) : (
                                    aiInsights?.strategy?.map((s: string, i: number) => (
                                        <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all text-xs font-bold leading-relaxed">
                                            <span className="text-primary" style={{ color: primaryColor }}>{i + 1}.</span> {s}
                                        </div>
                                    )) || <div className="text-xs text-white/20 italic">Awaiting more transaction data...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Consumer Behavior Analytics */}
            {vendor && (
                <section className="pulse-card">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight uppercase">Consumer Insights</h2>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                                What your customers are viewing and engaging with
                            </p>
                        </div>
                    </div>
                    <ConsumerInsights vendorId={vendor._id} />
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Critical Alerts */}
                <div className="pulse-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight uppercase">OPERATIONAL ALERTS</h3>
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black underline italic">REAL-TIME MONITORS</span>
                    </div>

                    <div className="space-y-4">
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
                <div className="pulse-card bg-primary text-black rounded-[48px] p-8 flex flex-col justify-between group overflow-hidden relative" style={{ backgroundColor: primaryColor }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl -mr-16 -mt-16" />

                    <div>
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 overflow-hidden border border-black/10">
                            {vendor?.logoUrl ? (
                                <img src={vendor.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Store className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{vendor?.shopName || "YOUR BRAND"}</h3>
                        <p className="text-sm font-bold opacity-60 leading-tight">Your custom branding is now live across the platform.</p>
                    </div>

                    <div className="mt-8 space-y-3 pt-6 border-t border-black/10">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase">
                            <span>Branding Sync</span>
                            <span className="flex items-center gap-1 font-black underline italic">Active</span>
                        </div>
                        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-black w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }: any) {
    return (
        <div className="pulse-card bg-white/[0.03] border border-white/10 p-8 rounded-[32px] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
                <div
                    className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white transition-all duration-500"
                    style={{ '--hover-color': color } as any}
                >
                    <div className="group-hover:text-black transition-colors" style={{ color: 'inherit' }}>{icon}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg" style={{ backgroundColor: `${color}20`, color: color }}>
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

function AlertRow({ title, desc, type, color }: any) {
    return (
        <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group/row">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                type === "stock" ? "bg-orange-500/10 text-orange-500" :
                    type === "payment" ? "bg-red-500/10 text-red-500" : ""
            )} style={type === "market" ? { backgroundColor: `${color}10`, color: color } : {}}>
                <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 opacity-0 group-hover/row:opacity-100 transition-all">
                ACTION
            </button>
        </div>
    );
}
