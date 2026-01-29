import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const getMarketIntelligence = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("marketIntelligence")
            .withIndex("by_product", (q) => q.eq("productId", args.productId))
            .unique();
    },
});

export const getVendorMarketOverview = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("marketIntelligence")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();
    },
});

export const getProductDetails = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.productId);
    },
});

export const updateMarketIndex = internalMutation({
    args: {
        productId: v.id("products"),
        vendorId: v.id("vendors"),
        matches: v.array(v.object({
            competitorName: v.string(),
            sourceUrl: v.string(),
            price: v.number(),
            currency: v.string(),
            matchConfidence: v.number(),
            reasoning: v.string(),
            differenceFound: v.optional(v.string()),
        })),
        marketSummary: v.object({
            lowestCompetitorPrice: v.number(),
            priceDifferencePercentage: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("marketIntelligence")
            .withIndex("by_product", (q) => q.eq("productId", args.productId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                matches: args.matches,
                marketSummary: args.marketSummary,
                lastUpdated: Date.now()
            });
        } else {
            await ctx.db.insert("marketIntelligence", {
                productId: args.productId,
                vendorId: args.vendorId,
                matches: args.matches,
                marketSummary: args.marketSummary,
                lastUpdated: Date.now()
            });
        }
    },
});
