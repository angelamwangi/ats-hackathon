"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Eye, TrendingUp, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConsumerInsights({ vendorId }: { vendorId: string }) {
    const insights = useQuery(api.consumerAnalytics.getConsumerInsights, { vendorId: vendorId as any });
    const recommendations = useQuery(api.consumerAnalytics.getStockRecommendations, { vendorId: vendorId as any });

    if (!insights || !recommendations) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-white/5 rounded-3xl"></div>
                <div className="h-32 bg-white/5 rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-white/40 uppercase tracking-widest">Total Views</p>
                    </div>
                    <p className="text-4xl font-black">{insights.summary.totalViews}</p>
                </div>

                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-white/40 uppercase tracking-widest">Avg Views/Product</p>
                    </div>
                    <p className="text-4xl font-black">{insights.summary.avgViewsPerProduct.toFixed(1)}</p>
                </div>

                <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-primary uppercase tracking-widest">Top Product</p>
                    </div>
                    <p className="text-lg font-black line-clamp-1">
                        {insights.summary.topViewedProduct?.productName || "N/A"}
                    </p>
                    <p className="text-xs text-white/40 font-bold mt-1">
                        {insights.summary.topViewedProduct?.views || 0} views
                    </p>
                </div>
            </div>

            {/* Stock Recommendations */}
            <div>
                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                    Stock Recommendations
                </h3>

                {recommendations.length === 0 ? (
                    <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center">
                        <p className="text-white/40 font-bold uppercase tracking-widest text-sm">
                            All stock levels are adequate
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <div
                                key={rec.productId}
                                className={cn(
                                    "p-6 rounded-3xl border-2 flex items-center justify-between group hover:scale-[1.02] transition-all",
                                    rec.urgencyScore > 60
                                        ? "bg-red-500/10 border-red-500/30"
                                        : rec.urgencyScore > 30
                                            ? "bg-orange-500/10 border-orange-500/30"
                                            : "bg-white/5 border-white/10"
                                )}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-black">{rec.productName}</h4>
                                        {rec.isHighDemand && (
                                            <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-full">
                                                High Demand
                                            </span>
                                        )}
                                        {rec.isLowStock && (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-full">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <p className="text-white/60 font-bold">
                                            <span className="text-white/40 uppercase text-xs">Stock:</span>{" "}
                                            <span className="text-white">{rec.currentStock} units</span>
                                        </p>
                                        <p className="text-white/60 font-bold">
                                            <span className="text-white/40 uppercase text-xs">Views:</span>{" "}
                                            <span className="text-white">{rec.viewCount}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="mb-2">
                                        <div className="text-xs font-black text-white/40 uppercase mb-1">
                                            Urgency Score
                                        </div>
                                        <div className="text-3xl font-black">{rec.urgencyScore}</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest",
                                            rec.urgencyScore > 60
                                                ? "bg-red-500 text-black"
                                                : rec.urgencyScore > 30
                                                    ? "bg-orange-500 text-black"
                                                    : "bg-primary/20 text-primary"
                                        )}
                                    >
                                        {rec.recommendedAction}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Viewed Products */}
            <div>
                <h3 className="text-2xl font-black uppercase mb-6">Trending Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.products.slice(0, 6).map((product) => (
                        <div
                            key={product.productId}
                            className="p-5 bg-white/[0.03] border border-white/10 rounded-3xl hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-lg mb-1">{product.productName}</h4>
                                    <p className="text-xs text-white/40 font-bold uppercase">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black">{product.views}</p>
                                    <p className="text-[10px] text-white/40 font-black uppercase">Views</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div>
                                    <p className="text-xs text-white/40 font-bold uppercase">Unique Visitors</p>
                                    <p className="text-lg font-black text-primary">{product.uniqueVisitors}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/40 font-bold uppercase">Current Stock</p>
                                    <p className="text-lg font-black">{product.stock}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
