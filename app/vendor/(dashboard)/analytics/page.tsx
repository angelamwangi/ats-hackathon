"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Star,
    Zap,
    Target,
    Clock,
    AlertTriangle,
    Package,
    BarChart3,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Flame,
    Snowflake,
    DollarSign,
    Layers,
    ChevronRight,
    Eye,
    Activity,
    Store,
    Wallet,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsumerInsights } from "@/components/vendor/ConsumerInsights";
import { useRouter } from "next/navigation";

export default function VendorAnalyticsPage() {
    const { user } = useUser();
    const router = useRouter();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const metrics = useQuery(api.vendorDashboard.getDashboardMetrics, vendor ? { vendorId: vendor._id } : "skip");

    const getAIAdvice = useAction(api.vendorDashboard.getComprehensiveAIAdvice);
    const [aiAdvice, setAiAdvice] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("week");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".analytics-card",
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    stagger: 0.08,
                    duration: 0.6,
                    ease: "power3.out",
                    clearProps: "all"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [metrics]);

    useEffect(() => {
        if (vendor && !aiAdvice && !loadingAI) {
            fetchAIAdvice();
        }
    }, [vendor]);

    const fetchAIAdvice = async () => {
        if (!vendor) return;
        setLoadingAI(true);
        try {
            const advice = await getAIAdvice({ vendorId: vendor._id });
            setAiAdvice(advice);
        } catch (error) {
            console.error("AI Advice Error:", error);
        } finally {
            setLoadingAI(false);
        }
    };

    const primaryColor = vendor?.brandConfig?.primaryColor || "#22c55e";

    const getRevenueByRange = () => {
        if (!metrics) return 0;
        switch (dateRange) {
            case "today": return metrics.revenue.today;
            case "week": return metrics.revenue.week;
            case "month": return metrics.revenue.month;
            case "all": return metrics.revenue.total;
        }
    };

    const getOrdersByRange = () => {
        if (!metrics) return 0;
        switch (dateRange) {
            case "today": return metrics.orders.today;
            case "week": return metrics.orders.week;
            case "month": return metrics.orders.total;
            case "all": return metrics.orders.total;
        }
    };

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-primary rounded-full animate-spin mx-auto shadow-2xl" />
                    <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Syncing Nexus Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-12 pb-20 bg-black min-h-screen p-6">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                <div>
                    <div
                        className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6 shadow-sm"
                        style={{ color: primaryColor }}
                    >
                        <Zap className="w-3.5 h-3.5" style={{ fill: primaryColor }} /> INTELLIGENCE HUB ACTIVE
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
                        {vendor?.shopName || "VENDOR"} <span className="text-primary not-italic">INTELLIGENCE</span>
                    </h1>
                    <p className="text-zinc-300 font-medium mt-6 max-w-2xl text-lg">Predictive diagnostics and real-time operational pulse for the autonomous enterprise.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-zinc-900 border-2 border-zinc-800 rounded-[24px] p-1.5 shadow-2xl">
                        {(["today", "week", "month", "all"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateRange === range
                                        ? "bg-white text-black shadow-lg"
                                        : "text-zinc-500 hover:text-white"
                                )}
                            >
                                {range === "all" ? "Total" : range}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchAIAdvice}
                        disabled={loadingAI}
                        className="flex items-center gap-3 px-8 py-5 bg-zinc-800 border-2 border-zinc-700 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all disabled:opacity-50 shadow-2xl"
                    >
                        <RefreshCw className={cn("w-5 h-5", loadingAI && "animate-spin")} />
                        {loadingAI ? "PROCESSING..." : "ACTIVATE AI"}
                    </button>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    title="Revenue"
                    value={`KSh ${Math.floor(getRevenueByRange()).toLocaleString()}`}
                    change={metrics.revenue.weekChange}
                    icon={<DollarSign className="w-6 h-6" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Active BNPL"
                    value={metrics.pulse?.activeBnplCount.toString() || "0"}
                    subtext="deferred payments"
                    icon={<Wallet className="w-6 h-6" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Customer Traffic"
                    value={metrics.pulse?.todaysTraffic.toString() || "0"}
                    subtext="today's engagement"
                    icon={<Users className="w-6 h-6" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Quality Rating"
                    value={metrics.products.avgQualityRating.toFixed(1)}
                    subtext="feedback average"
                    icon={<Star className="w-6 h-6" />}
                    color={primaryColor}
                />
            </div>

            {/* Revenue Trend + AI Command Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Revenue Trend Chart */}
                <div className="analytics-card lg:col-span-3 bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase text-white">Revenue Velocity</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Historical 30-day performance</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl border border-zinc-700">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl border border-zinc-700">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Order Count</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-1.5 px-4">
                        {metrics.trend.map((day, i) => {
                            const maxRevenue = Math.max(...metrics.trend.map(d => d.revenue), 1);
                            const height = (day.revenue / maxRevenue) * 100;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 group relative"
                                >
                                    <div
                                        className="w-full rounded-t-xl transition-all duration-500"
                                        style={{
                                            height: `${Math.max(height, 4)}%`,
                                            backgroundColor: day.revenue > 0 ? primaryColor : '#18181b', // zinc-900
                                        }}
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black border-2 border-zinc-700 rounded-2xl text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap z-50 shadow-2xl">
                                        {day.date}: KSh {Math.floor(day.revenue)} <span className="text-zinc-500 ml-2">[{day.orders} ORD]</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-8 text-[10px] text-zinc-600 font-black uppercase tracking-widest px-4 pt-8 border-t border-zinc-800">
                        <span>{metrics.trend[0]?.date}</span>
                        <span>{metrics.trend[metrics.trend.length - 1]?.date}</span>
                    </div>
                </div>

                {/* Opportunity Score */}
                <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 blur-[100px] -mr-32 -mt-32" />

                    <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-10 flex items-center gap-2 relative z-10">
                        <Target className="w-4 h-4 text-primary" /> Market Diagnostic
                    </div>

                    {loadingAI ? (
                        <div className="w-40 h-40 border-8 border-zinc-800 border-t-primary rounded-full animate-spin shadow-2xl" />
                    ) : (
                        <div className="relative w-48 h-48 group">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="84"
                                    fill="none"
                                    stroke="#18181b"
                                    strokeWidth="16"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="84"
                                    fill="none"
                                    stroke={primaryColor}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(aiAdvice?.opportunityScore || 0) * 5.27} 527`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-white tracking-tighter leading-none">{aiAdvice?.opportunityScore || 0}</span>
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Deltas Found</span>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-[10px] text-zinc-300 font-bold uppercase tracking-tight mt-10 leading-relaxed max-w-[200px] relative z-10">
                        {aiAdvice?.scoreReasoning || "Performing recursive market analysis..."}
                    </p>
                </div>
            </div>

            {/* AI Diagnostics & Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hot Sellers */}
                <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[40px] p-10 shadow-2xl space-y-8">
                    <div className="flex items-center gap-4 text-orange-500">
                        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                            <Flame className="w-8 h-8" />
                        </div>
                        <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Hot Sellers</h4>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-bold uppercase tracking-tight">
                        {aiAdvice?.insights?.hotProducts || "Awaiting transaction volume to identify high-velocity SKUs."}
                    </p>
                    <div className="pt-6 border-t border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Growth Recommendation</p>
                        <p className="text-xs font-black text-primary mt-2 uppercase tracking-tight" style={{ color: primaryColor }}>Increase safety stock by 35% on top performers</p>
                    </div>
                </div>

                {/* Dead Stock */}
                <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[40px] p-10 shadow-2xl space-y-8">
                    <div className="flex items-center gap-4 text-blue-400">
                        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                            <Snowflake className="w-8 h-8" />
                        </div>
                        <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Dead Stock</h4>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-bold uppercase tracking-tight">
                        {aiAdvice?.insights?.coldProducts || "Inventory flow is currently within optimal liquidity parameters."}
                    </p>
                    <div className="pt-6 border-t border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Liquidate Strategy</p>
                        <p className="text-xs font-black text-blue-400 mt-2 uppercase tracking-tight">Trigger 15% flash discount to reclaim capital</p>
                    </div>
                </div>

                {/* Operational Health */}
                <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[40px] p-10 shadow-2xl space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tighter uppercase text-white">System Alerts</h3>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">LIVE</span>
                    </div>

                    <div className="space-y-4">
                        <AlertRow
                            title="Market Position"
                            desc="Competitors have lowered prices in Electronics."
                            type="market"
                            color={primaryColor}
                        />
                        <AlertRow
                            title="Terminal Online"
                            desc="POS interface is synced with retail network."
                            type="status"
                            color={primaryColor}
                        />
                    </div>
                </div>
            </div>

            {/* AI Command Panel */}
            <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[56px] p-12 lg:p-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-800/10 blur-[150px] -mr-32 -mt-32" />

                <div className="flex items-center gap-4 mb-14 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl">
                        <Zap className="w-8 h-8 text-primary shadow-primary" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Strategic Execution</h2>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Autonomous recommendations for market dominance</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    <ActionColumn
                        title="Aggressive"
                        subtitle="Immediate impact"
                        actions={aiAdvice?.immediateActions || []}
                        loading={loadingAI}
                        color="#ef4444"
                        icon={<AlertTriangle className="w-6 h-6" />}
                    />
                    <ActionColumn
                        title="Tactical"
                        subtitle="In-flight wins"
                        actions={aiAdvice?.thisWeek || []}
                        loading={loadingAI}
                        color="#f59e0b"
                        icon={<Clock className="w-6 h-6" />}
                    />
                    <ActionColumn
                        title="Systemic"
                        subtitle="Macro trajectory"
                        actions={aiAdvice?.thisMonth || []}
                        loading={loadingAI}
                        color={primaryColor}
                        icon={<Target className="w-6 h-6" />}
                    />
                </div>
            </div>

            {/* Product Performance + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Product Performance Table */}
                <div className="analytics-card lg:col-span-3 bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase text-white">SKU Performance</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Revenue distribution across catalog</p>
                        </div>
                        <span className="px-5 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-inner">
                            {metrics.products.total} Total SKUs
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                        {metrics.products.topProducts.map((product, i) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-6 p-6 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-zinc-500 transition-all group shadow-inner"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-white shadow-xl group-hover:bg-primary group-hover:text-black transition-all">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-lg uppercase tracking-tight text-white truncate">{product.name}</h4>
                                        {product.isHot && (
                                            <span className="px-3 py-1 bg-orange-500 text-black rounded-lg text-[8px] font-black flex items-center gap-1.5 shadow-lg">
                                                <Flame className="w-3 h-3" /> VOLATILE
                                            </span>
                                        )}
                                        {product.isLowStock && (
                                            <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black shadow-lg">
                                                DEPLETING
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xl text-white tracking-tighter">KSh {Math.floor(product.revenue).toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{product.unitsSold} UNITS</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="analytics-card lg:col-span-2 bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 shadow-2xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center">
                            <Layers className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase text-white">Sector Matrix</h3>
                    </div>

                    <div className="space-y-8">
                        {metrics.categories.map((cat, i) => {
                            const totalRevenue = metrics.categories.reduce((s, c) => s + c.revenue, 0) || 1;
                            const percentage = (cat.revenue / totalRevenue) * 100;
                            const colors = [primaryColor, "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
                            const color = colors[i % colors.length];

                            return (
                                <div key={cat.name} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-sm uppercase tracking-widest text-white">{cat.name}</span>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">KSh {Math.floor(cat.revenue).toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%`, backgroundColor: color }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                        <span>{cat.units} SKUs SOLD</span>
                                        <span className="text-white bg-zinc-800 px-2 py-0.5 rounded-md">{percentage.toFixed(1)}% SHARE</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Consumer Behavior Real-time Embed */}
            {vendor && (
                <section className="analytics-card space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-center text-primary shadow-2xl">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Engagement Behavioral Analytics</h2>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2">Real-time consumer intent monitoring</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-[56px] p-2 shadow-2xl">
                        <ConsumerInsights vendorId={vendor._id} />
                    </div>
                </section>
            )}

            {/* AI Insights Panel */}
            {aiAdvice?.insights && (
                <div className="analytics-card bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 shadow-2xl">
                    <h3 className="text-3xl font-black tracking-tighter uppercase mb-12 flex items-center gap-4 text-white">
                        <Zap className="w-8 h-8 text-primary shadow-primary" /> Core Intel
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <InsightCard
                            title="Growth Drivers"
                            content={aiAdvice.insights.hotProducts}
                            icon={<Flame className="w-6 h-6 text-orange-500" />}
                        />
                        <InsightCard
                            title="Sector Attrition"
                            content={aiAdvice.insights.coldProducts}
                            icon={<Snowflake className="w-6 h-6 text-blue-400" />}
                        />
                        <InsightCard
                            title="Expansion Slots"
                            content={aiAdvice.insights.categoryOpportunity}
                            icon={<Layers className="w-6 h-6 text-purple-400" />}
                        />
                        <InsightCard
                            title="Price Elasticity"
                            content={aiAdvice.insights.pricingAdvice}
                            icon={<DollarSign className="w-6 h-6 text-green-400" />}
                        />
                        <InsightCard
                            title="Supply Chain"
                            content={aiAdvice.insights.inventoryAdvice}
                            icon={<Package className="w-6 h-6 text-amber-400" />}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({ title, value, change, subtext, icon, color }: {
    title: string;
    value: string;
    change?: number;
    subtext?: string;
    icon: React.ReactNode;
    color: string;
}) {
    const isPositive = (change ?? 0) >= 0;

    return (
        <div className="analytics-card bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[40px] hover:border-zinc-500 transition-all group shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl border border-zinc-800 bg-zinc-950"
                >
                    <div style={{ color }}>{icon}</div>
                </div>
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg",
                        isPositive ? "bg-zinc-800 text-green-500 border border-green-900" : "bg-zinc-800 text-red-500 border border-red-900"
                    )}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1 relative z-10">{title}</p>
            <p className="text-4xl font-black tracking-tighter text-white relative z-10">{value}</p>
            {subtext && <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-4 ml-1 relative z-10">{subtext}</p>}
        </div>
    );
}

function ActionColumn({ title, subtitle, actions, loading, color, icon }: {
    title: string;
    subtitle: string;
    actions: { action: string; impact: string; reason: string }[];
    loading: boolean;
    color: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="space-y-10 group">
            <div className="flex items-center gap-5">
                <div
                    className="w-14 h-14 rounded-[20px] bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                    style={{ color }}
                >
                    {icon}
                </div>
                <div>
                    <h4 className="font-black uppercase text-lg tracking-tighter text-white">{title}</h4>
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="h-40 bg-zinc-950 border border-zinc-800 rounded-[32px] animate-pulse" />
                    ))
                ) : actions.length > 0 ? (
                    actions.map((item, i) => (
                        <div
                            key={i}
                            className="p-8 bg-zinc-950 border border-zinc-800 rounded-[32px] hover:border-zinc-700 transition-all shadow-inner relative group/item"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg border border-zinc-800 bg-zinc-900 group-hover/item:bg-white group-hover/item:text-black transition-all"
                                    style={{ color }}
                                >
                                    {i + 1}
                                </div>
                                <div className="space-y-3">
                                    <p className="font-black text-sm uppercase tracking-tight text-white leading-snug">{item.action}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide leading-relaxed">{item.reason}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-3">
                                <span
                                    className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg border border-zinc-800 bg-zinc-900"
                                    style={{ color }}
                                >
                                    {item.impact} IMPACT
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 bg-zinc-950 border border-dashed border-zinc-800 rounded-[32px] text-center">
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No strategic delta detected</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function InsightCard({ title, content, icon }: {
    title: string;
    content: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-[32px] hover:border-zinc-700 transition-all group shadow-inner">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform shadow-xl">
                    {icon}
                </div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-white leading-none">{title}</h4>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide leading-relaxed">{content}</p>
        </div>
    );
}

function AlertRow({ title, desc, type, color }: any) {
    return (
        <div className="flex items-center gap-5 p-4 bg-zinc-950 border border-zinc-800 rounded-[24px] hover:border-zinc-700 transition-all group/row shadow-sm">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                type === "market" ? "bg-zinc-900 text-orange-500 border-orange-900" :
                    "bg-zinc-900 border-zinc-800 text-white"
            )} style={type === "market" ? { color: color, borderColor: `${color}40` } : {}}>
                <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="font-black text-xs text-white uppercase tracking-tight leading-none mb-1">{title}</p>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{desc}</p>
            </div>
        </div>
    );
}
