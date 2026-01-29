"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    LayoutDashboard,
    TrendingDown,
    TrendingUp,
    Zap,
    Target,
    ArrowRight,
    AlertCircle,
    Info,
    Sparkles,
    Eye,
    ChevronRight,
    Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function VendorIntelligencePage() {
    const products = useQuery(api.products.getProducts, {}); // Ideally filter by vendor
    const marketIntel = useQuery(api.market_intel.getVendorMarketOverview, products && products.length > 0 ? { vendorId: products[0].vendorId as any } : "skip") || [];
    const comparePrices = useAction(api.market_actions.compareCompetitorPrices);
    const updatePrice = useMutation(api.products.updateProductPrice);
    const [scanningId, setScanningId] = useState<string | null>(null);

    const handleBatchScan = async () => {
        if (!products) return;
        for (const p of products) {
            setScanningId(p._id);
            try {
                await comparePrices({ productId: p._id });
            } catch (e) {
                console.error(e);
            }
        }
        setScanningId(null);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 lg:p-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Target className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">AI COMMAND CENTER</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic">
                        Market <span className="text-primary not-italic">War Room</span>
                    </h1>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest mt-2 max-w-md">
                        Real-time competitive intelligence and autonomous repricing suggestions powered by Gemini semantic matching.
                    </p>
                </div>
                <button
                    onClick={handleBatchScan}
                    disabled={scanningId !== null}
                    className="px-8 py-4 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                >
                    {scanningId ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {scanningId ? "COMMENCING GLOBAL SCAN..." : "INITIATE MARKET SYNC"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingDown className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Pricing Health</p>
                        <p className="text-4xl font-black">92%</p>
                        <p className="text-[10px] text-primary font-bold uppercase mt-2">Competitive Edge</p>
                    </div>

                    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px]">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Gemini Insight</p>
                        <div className="flex gap-4">
                            <Sparkles className="w-5 h-5 text-primary shrink-0" />
                            <p className="text-[11px] text-white leading-relaxed font-medium">
                                "Competitors across Google are adding 'Eco-friendly' descriptions to electronics. Suggestion: Update your product tags to improve search ranking."
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Intel Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-white">Product Intelligence Index</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {products?.map((product) => {
                            const intel = marketIntel.find((i: any) => i.productId === product._id);
                            const isAtRisk = intel && intel.marketSummary.priceDifferencePercentage > 0;

                            return (
                                <div key={product._id} className="group bg-white/[0.02] border border-white/10 rounded-[40px] p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</span>
                                            {isAtRisk && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                                                    <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                                                    <span className="text-[8px] font-black text-red-500 uppercase">PRICING RISK</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">{product.name}</h3>
                                        <div className="flex items-center gap-4 mt-4 text-[10px] font-black uppercase text-white tracking-[0.2em]">
                                            <span>Current: ${product.price}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span>Market Low: ${intel?.marketSummary.lowestCompetitorPrice || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        {intel ? (
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-white uppercase mb-1">Gap Analysis</p>
                                                <p className={cn(
                                                    "text-2xl font-black tracking-tighter",
                                                    intel.marketSummary.priceDifferencePercentage < 0 ? "text-primary" : "text-red-500"
                                                )}>
                                                    {intel.marketSummary.priceDifferencePercentage > 0 ? "+" : ""}
                                                    {intel.marketSummary.priceDifferencePercentage}%
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-8 bg-white/5 rounded-full animate-pulse" />
                                        )}

                                        <div className="h-12 w-[1px] bg-white/10 hidden md:block" />

                                        <div className="flex flex-col gap-2">
                                            {isAtRisk ? (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Reprice ${product.name} to $${intel.marketSummary.lowestCompetitorPrice}?`)) {
                                                            await updatePrice({ productId: product._id, price: intel.marketSummary.lowestCompetitorPrice });
                                                        }
                                                    }}
                                                    className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Reprice to Match
                                                </button>
                                            ) : (
                                                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                                    View Matches
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

