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
import { useNexusDialog } from "@/components/providers/NexusDialogProvider";

export default function VendorIntelligencePage() {
    const products = useQuery(api.products.getProducts, {}); // Ideally filter by vendor
    const marketIntel = useQuery(api.market_intel.getVendorMarketOverview, products && products.length > 0 ? { vendorId: products[0].vendorId as any } : "skip") || [];
    const comparePrices = useAction(api.market_actions.compareCompetitorPrices);
    const updatePrice = useMutation(api.products.updateProductPrice);
    const [scanningId, setScanningId] = useState<string | null>(null);
    const { confirm, alert } = useNexusDialog();

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
        <div className="min-h-screen bg-black text-white p-6 pb-20">
            <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 text-primary mb-4 bg-zinc-900 border border-zinc-800 w-fit px-4 py-1.5 rounded-full shadow-sm">
                        <Target className="w-4 h-4 shadow-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">INTEL COMMAND</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                        Market <span className="text-primary not-italic">War Room</span>
                    </h1>
                    <p className="text-zinc-300 text-sm font-medium mt-6 max-w-xl leading-relaxed">
                        Real-time competitive intelligence and autonomous repricing suggestions powered by Gemini semantic matching.
                    </p>
                </div>
                <button
                    onClick={handleBatchScan}
                    disabled={scanningId !== null}
                    className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50 shrink-0"
                >
                    {scanningId ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                    {scanningId ? "SCANNING..." : "SYNC MARKET"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:col-cols-4 gap-6 md:gap-8">
                {/* Stats Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="p-8 bg-zinc-900 border border-zinc-700 rounded-[40px] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 text-zinc-800 group-hover:text-zinc-700 transition-colors">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">Pricing Delta</p>
                        <p className="text-5xl font-black text-white relative z-10">92%</p>
                        <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg w-fit relative z-10">
                            <TrendingUp className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Optimal Edge</span>
                        </div>
                    </div>

                    <div className="p-8 bg-zinc-900 border border-zinc-700 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Gemini Insight
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed font-bold uppercase tracking-tight italic">
                            "Competitors across Nexus are prioritizing 'Ultra-Premium' tiering. Adjustment: Consider value-add bundles to maintain market share."
                        </p>
                    </div>

                    <div className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-[40px] shadow-xl group hover:border-primary transition-all cursor-pointer">
                        <Zap className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black text-xs text-white uppercase tracking-widest mb-2">Auto-Reprice</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight leading-relaxed">
                            Enable autonomous repricing to react to market fluctuations in under 5 minutes.
                        </p>
                    </div>
                </aside>

                {/* Main Intel Grid */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Product Intelligence Index</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {products?.map((product) => {
                            const intel = marketIntel.find((i: any) => i.productId === product._id);
                            const isAtRisk = intel && intel.marketSummary.priceDifferencePercentage > 0;

                            return (
                                <div key={product._id} className="group bg-zinc-900 border border-zinc-700 rounded-[40px] p-6 md:p-8 hover:border-zinc-500 transition-all flex flex-col md:flex-row md:items-center gap-6 md:gap-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 blur-[80px] -mr-16 -mt-16" />

                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                                            <span className="px-3 py-1 bg-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest rounded-md border border-zinc-700">{product.category}</span>
                                            {isAtRisk && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-red-900 rounded-full">
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">PRICING GAP</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none truncate">{product.name}</h3>
                                        <div className="flex items-center gap-6 mt-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current SKU</span>
                                                <span className="text-xl font-black text-white tracking-tighter">KSh {Math.floor(product.price)}</span>
                                            </div>
                                            <div className="w-px h-8 bg-zinc-800" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Market Floor</span>
                                                <span className="text-xl font-black text-zinc-400 tracking-tighter">KSh {intel?.marketSummary.lowestCompetitorPrice ? Math.floor(intel.marketSummary.lowestCompetitorPrice) : "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 md:gap-10 relative z-10 shrink-0">
                                        {intel ? (
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Delta Analysis</p>
                                                <p className={cn(
                                                    "text-4xl font-black tracking-tighter leading-none transition-colors",
                                                    intel.marketSummary.priceDifferencePercentage < 0 ? "text-primary" : "text-red-500"
                                                )}>
                                                    {intel.marketSummary.priceDifferencePercentage > 0 ? "+" : ""}
                                                    {intel.marketSummary.priceDifferencePercentage}%
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-10 bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />
                                        )}

                                        <div className="flex flex-col gap-3 min-w-[180px]">
                                            {isAtRisk ? (
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = await confirm(
                                                            "Autonomous Reprice",
                                                            `Accept Gemini's adjustment for ${product.name} to KSh ${Math.floor(intel.marketSummary.lowestCompetitorPrice)}?`
                                                        );
                                                        if (confirmed) {
                                                            await updatePrice({ productId: product._id, price: intel.marketSummary.lowestCompetitorPrice });
                                                            await alert("Pricing Updated", "The new SKU floor has been published to the storefront.");
                                                        }
                                                    }}
                                                    className="w-full py-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                                                >
                                                    Reprice to Match
                                                </button>
                                            ) : (
                                                <button className="w-full py-4 bg-zinc-800 border border-zinc-700 text-white hover:bg-white hover:text-black hover:border-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group/btn">
                                                    View Match Sources <ArrowRight className="w-3 h-3 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
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
