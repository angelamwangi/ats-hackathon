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
                <div className="h-32 bg-zinc-900 rounded-3xl"></div>
                <div className="h-32 bg-zinc-900 rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Total Views</p>
                    </div>
                    <p className="text-4xl font-black text-white">{insights.summary.totalViews}</p>
                </div>

                <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Avg Views/Product</p>
                    </div>
                    <p className="text-4xl font-black text-white">{insights.summary.avgViewsPerProduct.toFixed(1)}</p>
                </div>

                <div className="p-6 bg-zinc-900 border-2 border-primary rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-primary uppercase tracking-widest">Top Product</p>
                    </div>
                    <p className="text-lg font-black line-clamp-1 text-white">
                        {insights.summary.topViewedProduct?.productName || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500 font-bold mt-1 uppercase">
                        {insights.summary.topViewedProduct?.views || 0} global views
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
                    <div className="p-12 bg-zinc-900 border border-dashed border-zinc-700 rounded-3xl text-center">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                            All stock levels are adequate
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec) => (
                            <div
                                key={rec.productId}
                                className={cn(
                                    "p-6 rounded-3xl border-2 flex items-center justify-between group hover:border-zinc-500 transition-all",
                                    rec.urgencyScore > 60
                                        ? "bg-zinc-900 border-red-900"
                                        : rec.urgencyScore > 30
                                            ? "bg-zinc-900 border-orange-900"
                                            : "bg-zinc-900 border-zinc-800"
                                )}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-black">{rec.productName}</h4>
                                        {rec.isHighDemand && (
                                            <span className="px-2 py-1 bg-zinc-800 border border-primary text-primary text-[10px] font-black uppercase rounded-full">
                                                High Demand
                                            </span>
                                        )}
                                        {rec.isLowStock && (
                                            <span className="px-2 py-1 bg-zinc-800 border border-red-900 text-red-500 text-[10px] font-black uppercase rounded-full">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <p className="text-zinc-400 font-bold uppercase tracking-tight">
                                            <span className="text-zinc-600 uppercase text-xs">Stock:</span>{" "}
                                            <span className="text-white">{rec.currentStock} units</span>
                                        </p>
                                        <p className="text-zinc-400 font-bold uppercase tracking-tight">
                                            <span className="text-zinc-600 uppercase text-xs">Views:</span>{" "}
                                            <span className="text-white">{rec.viewCount}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="mb-2">
                                        <div className="text-xs font-black text-zinc-600 uppercase mb-1">
                                            Urgency Score
                                        </div>
                                        <div className="text-3xl font-black text-white">{rec.urgencyScore}</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest",
                                            rec.urgencyScore > 60
                                                ? "bg-red-600 text-white"
                                                : rec.urgencyScore > 30
                                                    ? "bg-orange-600 text-black"
                                                    : "bg-zinc-800 text-primary border border-primary"
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
                            className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-zinc-500 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-lg mb-1 text-white">{product.productName}</h4>
                                    <p className="text-xs text-zinc-600 font-bold uppercase">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white">{product.views}</p>
                                    <p className="text-[10px] text-zinc-600 font-black uppercase">Engagement</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                <div>
                                    <p className="text-xs text-zinc-600 font-bold uppercase">Reach</p>
                                    <p className="text-lg font-black text-primary">{product.uniqueVisitors}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-600 font-bold uppercase">Inventory</p>
                                    <p className="text-lg font-black text-white">{product.stock}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
