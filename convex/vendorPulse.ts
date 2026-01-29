import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPulseMetrics = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const now = Date.now();
        const startOfDay = new Date().setHours(0, 0, 0, 0);

        // 1. Today's Sales
        const todaysOrders = await ctx.db
            .query("orders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) => q.gte(q.field("_creationTime"), startOfDay))
            .collect();

        const todaysSales = todaysOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        // 2. Active BNPL (Buy Now Pay Later)
        const activeBnpl = await ctx.db
            .query("bnplOrders")
            .withIndex("by_vendor_status", (q) => q.eq("vendorId", args.vendorId).eq("status", "active"))
            .collect();

        // 3. Average Quality Rating
        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        const avgRating = products.length > 0
            ? products.reduce((acc, p) => acc + p.qualityRating, 0) / products.length
            : 0;

        // 4. Customer Traffic (Today's Product Visits)
        const todaysVisits = await ctx.db
            .query("productVisits")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) => q.gte(q.field("timestamp"), startOfDay))
            .collect();

        return {
            todaysSales,
            activeBnplCount: activeBnpl.length,
            avgRating: Number(avgRating.toFixed(1)),
            todaysTraffic: todaysVisits.length
        };
    },
});
