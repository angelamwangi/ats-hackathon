import { v } from "convex/values";
import { action, query } from "./_generated/server";

// Helper to aggregate product views and interactions from PostHog
// This creates a simple local analytics store that vendors can query

export const getConsumerInsights = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        // Get all products for this vendor
        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        // Get visits for all vendor products
        const productInsights = await Promise.all(
            products.map(async (product) => {
                // productVisits has index by_user, we need to filter by productId
                const allVisits = await ctx.db
                    .query("productVisits")
                    .collect();

                const visits = allVisits.filter(v => v.productId === product._id);

                const uniqueVisitors = new Set(visits.map((v) => v.userId)).size;
                const totalViews = visits.length;

                return {
                    productId: product._id,
                    productName: product.name,
                    category: product.category,
                    price: product.price,
                    stock: product.stock,
                    views: totalViews,
                    uniqueVisitors,
                    viewsPerVisitor: uniqueVisitors > 0 ? totalViews / uniqueVisitors : 0,
                };
            })
        );

        // Sort by views descending
        const sortedByViews = [...productInsights].sort((a, b) => b.views - a.views);

        // Calculate engagement metrics
        const totalViews = productInsights.reduce((sum, p) => sum + p.views, 0);
        const avgViewsPerProduct = products.length > 0 ? totalViews / products.length : 0;

        return {
            products: sortedByViews,
            summary: {
                totalViews,
                avgViewsPerProduct,
                topViewedProduct: sortedByViews[0] || null,
            },
        };
    },
});

// Get products that need restocking based on consumer interest
export const getStockRecommendations = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const insights = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        // Get all visits once
        const allVisits = await ctx.db.query("productVisits").collect();

        const recommendations = await Promise.all(
            insights.map(async (product) => {
                const visits = allVisits.filter(v => v.productId === product._id);

                const views = visits.length;
                const stockLevel = product.stock;
                const isLowStock = stockLevel < product.minStockThreshold;
                const isHighDemand = views > 10; // Threshold for high demand

                // Calculate urgency score (0-100)
                const viewScore = Math.min(views * 5, 50); // Max 50 points from views
                const stockScore = isLowStock ? 30 : 0; // 30 points if low stock
                const demandMultiplier = isHighDemand ? 1.5 : 1;
                const urgencyScore = Math.min((viewScore + stockScore) * demandMultiplier, 100);

                return {
                    productId: product._id,
                    productName: product.name,
                    currentStock: stockLevel,
                    viewCount: views,
                    urgencyScore: Math.round(urgencyScore),
                    isLowStock,
                    isHighDemand,
                    recommendedAction: urgencyScore > 60
                        ? "Restock Immediately"
                        : urgencyScore > 30
                            ? "Monitor Closely"
                            : "Stock Adequate",
                };
            })
        );

        // Sort by urgency score
        return recommendations
            .sort((a, b) => b.urgencyScore - a.urgencyScore)
            .filter((r) => r.urgencyScore > 20); // Only show items worth attention
    },
});
