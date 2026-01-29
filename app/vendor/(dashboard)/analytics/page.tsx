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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VendorAnalyticsPage() {
    const { user } = useUser();
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
            case "month": return metrics.orders.total; // Approximate
            case "all": return metrics.orders.total;
        }
    };

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div
                        className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit mb-3"
                        style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}40`, color: primaryColor }}
                    >
                        <BarChart3 className="w-3 h-3" /> ANALYTICS COMMAND CENTER
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">
                        {vendor?.shopName || "VENDOR"} <span className="text-white/20">INSIGHTS</span>
                    </h1>
                    <p className="text-white/40 font-medium mt-1">Data-driven intelligence to maximize your sales.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date Range Selector */}
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                        {(["today", "week", "month", "all"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateRange === range
                                        ? "bg-white text-black"
                                        : "text-white/40 hover:text-white"
                                )}
                            >
                                {range === "all" ? "All Time" : range}
                            </button>
                        ))}
                    </div>

                    {/* Refresh AI */}
                    <button
                        onClick={fetchAIAdvice}
                        disabled={loadingAI}
                        className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loadingAI && "animate-spin")} />
                        {loadingAI ? "Analyzing..." : "Refresh AI"}
                    </button>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Revenue"
                    value={`$${getRevenueByRange().toLocaleString()}`}
                    change={metrics.revenue.weekChange}
                    icon={<DollarSign className="w-5 h-5" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Orders"
                    value={getOrdersByRange().toString()}
                    subtext={`$${metrics.orders.avgValue} avg`}
                    icon={<ShoppingCart className="w-5 h-5" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Customers"
                    value={metrics.customers.unique.toString()}
                    subtext="unique buyers"
                    icon={<Users className="w-5 h-5" />}
                    color={primaryColor}
                />
                <MetricCard
                    title="Quality Score"
                    value={metrics.products.avgQualityRating.toFixed(1)}
                    subtext="avg rating"
                    icon={<Star className="w-5 h-5" />}
                    color={primaryColor}
                />
            </div>

            {/* Revenue Trend + AI Command Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="analytics-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Revenue Trend</h3>
                            <p className="text-xs text-white/40 mt-1">Last 30 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                                <span className="text-white/40">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/20" />
                                <span className="text-white/40">Orders</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="h-48 flex items-end gap-1">
                        {metrics.trend.map((day, i) => {
                            const maxRevenue = Math.max(...metrics.trend.map(d => d.revenue), 1);
                            const height = (day.revenue / maxRevenue) * 100;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 group relative"
                                >
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                                        style={{
                                            height: `${Math.max(height, 2)}%`,
                                            backgroundColor: day.revenue > 0 ? primaryColor : 'rgba(255,255,255,0.1)',
                                        }}
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white/20 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {day.date}: ${day.revenue} ({day.orders} orders)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-white/30 font-bold">
                        <span>{metrics.trend[0]?.date}</span>
                        <span>{metrics.trend[metrics.trend.length - 1]?.date}</span>
                    </div>
                </div>

                {/* Opportunity Score */}
                <div className="analytics-card bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20" style={{ backgroundColor: primaryColor }} />

                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 mb-6">
                        <Target className="w-4 h-4" /> Opportunity Score
                    </div>

                    {loadingAI ? (
                        <div className="w-32 h-32 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                    ) : (
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="none"
                                    stroke={primaryColor}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(aiAdvice?.opportunityScore || 0) * 4.4} 440`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black">{aiAdvice?.opportunityScore || 0}</span>
                                <span className="text-[10px] text-white/40 font-bold">/ 100</span>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-xs text-white/40 mt-6 leading-relaxed max-w-[200px]">
                        {aiAdvice?.scoreReasoning || "Analyzing your business performance..."}
                    </p>
                </div>
            </div>

            {/* AI Command Panel */}
            <div className="analytics-card bg-white/[0.03] border border-white/10 rounded-[48px] p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[120px] opacity-10" style={{ backgroundColor: primaryColor }} />

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                        <Zap className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">AI Action Plan</h2>
                        <p className="text-xs text-white/40">Gemini-powered recommendations to maximize sales</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Immediate Actions */}
                    <ActionColumn
                        title="Immediate Actions"
                        subtitle="Do these now"
                        actions={aiAdvice?.immediateActions || []}
                        loading={loadingAI}
                        color="#ef4444"
                        icon={<AlertTriangle className="w-5 h-5" />}
                    />

                    {/* This Week */}
                    <ActionColumn
                        title="This Week"
                        subtitle="Quick wins"
                        actions={aiAdvice?.thisWeek || []}
                        loading={loadingAI}
                        color="#f59e0b"
                        icon={<Clock className="w-5 h-5" />}
                    />

                    {/* This Month */}
                    <ActionColumn
                        title="This Month"
                        subtitle="Strategic plays"
                        actions={aiAdvice?.thisMonth || []}
                        loading={loadingAI}
                        color={primaryColor}
                        icon={<Target className="w-5 h-5" />}
                    />
                </div>
            </div>

            {/* Product Performance + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Performance Table */}
                <div className="analytics-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Product Performance</h3>
                            <p className="text-xs text-white/40 mt-1">Revenue & sales by product</p>
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-white/40">
                            {metrics.products.total} Products
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {metrics.products.topProducts.map((product, i) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white/40">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm truncate">{product.name}</h4>
                                        {product.isHot && (
                                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full text-[10px] font-black flex items-center gap-1">
                                                <Flame className="w-3 h-3" /> HOT
                                            </span>
                                        )}
                                        {product.isCold && (
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black flex items-center gap-1">
                                                <Snowflake className="w-3 h-3" /> COLD
                                            </span>
                                        )}
                                        {product.isLowStock && (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black">
                                                LOW STOCK
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-0.5">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm">${product.revenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-white/40">{product.unitsSold} sold</p>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    <p className={cn(
                                        "font-bold text-sm",
                                        product.isLowStock ? "text-red-500" : "text-white/60"
                                    )}>
                                        {product.stock}
                                    </p>
                                    <p className="text-[10px] text-white/40">in stock</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="analytics-card bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center gap-2 mb-8">
                        <Layers className="w-5 h-5 text-white/40" />
                        <h3 className="text-xl font-black tracking-tight uppercase">Categories</h3>
                    </div>

                    <div className="space-y-4">
                        {metrics.categories.map((cat, i) => {
                            const totalRevenue = metrics.categories.reduce((s, c) => s + c.revenue, 0) || 1;
                            const percentage = (cat.revenue / totalRevenue) * 100;
                            const colors = [primaryColor, "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
                            const color = colors[i % colors.length];

                            return (
                                <div key={cat.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm">{cat.name}</span>
                                        <span className="text-xs text-white/40">${cat.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%`, backgroundColor: color }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-white/40">
                                        <span>{cat.units} units</span>
                                        <span>{percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* AI Insights Panel */}
            {aiAdvice?.insights && (
                <div className="analytics-card bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <h3 className="text-xl font-black tracking-tight uppercase mb-8 flex items-center gap-3">
                        <Zap className="w-5 h-5" style={{ color: primaryColor }} /> Deep Insights
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InsightCard
                            title="Hot Products"
                            content={aiAdvice.insights.hotProducts}
                            icon={<Flame className="w-5 h-5 text-orange-500" />}
                        />
                        <InsightCard
                            title="Cold Products"
                            content={aiAdvice.insights.coldProducts}
                            icon={<Snowflake className="w-5 h-5 text-blue-400" />}
                        />
                        <InsightCard
                            title="Category Opportunity"
                            content={aiAdvice.insights.categoryOpportunity}
                            icon={<Layers className="w-5 h-5 text-purple-400" />}
                        />
                        <InsightCard
                            title="Pricing Advice"
                            content={aiAdvice.insights.pricingAdvice}
                            icon={<DollarSign className="w-5 h-5 text-green-400" />}
                        />
                        <InsightCard
                            title="Inventory Advice"
                            content={aiAdvice.insights.inventoryAdvice}
                            icon={<Package className="w-5 h-5 text-amber-400" />}
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
        <div className="analytics-card bg-white/[0.03] border border-white/10 p-6 rounded-[28px] hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
                        isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-white/40 mt-1">{subtext}</p>}
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
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    {icon}
                </div>
                <div>
                    <h4 className="font-black uppercase text-sm tracking-tight">{title}</h4>
                    <p className="text-[10px] text-white/40">{subtitle}</p>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : actions.length > 0 ? (
                    actions.map((item, i) => (
                        <div
                            key={i}
                            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                                    style={{ backgroundColor: `${color}20`, color }}
                                >
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{item.action}</p>
                                    <p className="text-[10px] text-white/40 mt-1">{item.reason}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                                    style={{
                                        backgroundColor: `${color}15`,
                                        color,
                                    }}
                                >
                                    {item.impact} impact
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-white/20 italic p-4">No recommendations yet.</p>
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
        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
                {icon}
                <h4 className="font-black uppercase text-xs tracking-widest">{title}</h4>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{content}</p>
        </div>
    );
}
