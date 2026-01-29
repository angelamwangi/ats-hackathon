import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserLoyaltyCards = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const cards = await ctx.db
            .query("loyaltyCards")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return await Promise.all(
            cards.map(async (card) => {
                const vendor = await ctx.db.get(card.vendorId);
                return {
                    ...card,
                    vendorName: vendor?.shopName || "Unknown shop",
                    brandConfig: vendor?.brandConfig,
                    logoUrl: vendor?.logoUrl,
                };
            })
        );
    },
});

export const getCardByVendor = query({
    args: { userId: v.id("users"), vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("loyaltyCards")
            .withIndex("by_vendor_user", (q) =>
                q.eq("vendorId", args.vendorId).eq("userId", args.userId)
            )
            .unique();
    },
});

export const addPoints = mutation({
    args: {
        userId: v.id("users"),
        vendorId: v.id("vendors"),
        points: v.number(),
    },
    handler: async (ctx, args) => {
        const existingCard = await ctx.db
            .query("loyaltyCards")
            .withIndex("by_vendor_user", (q) =>
                q.eq("vendorId", args.vendorId).eq("userId", args.userId)
            )
            .unique();

        if (existingCard) {
            await ctx.db.patch(existingCard._id, {
                points: existingCard.points + args.points,
            });
            return existingCard._id;
        } else {
            return await ctx.db.insert("loyaltyCards", {
                userId: args.userId,
                vendorId: args.vendorId,
                points: args.points,
            });
        }
    },
});

export const getVendorLoyaltyMetrics = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const startOfDay = new Date().setHours(0, 0, 0, 0);

        const cards = await ctx.db
            .query("loyaltyCards")
            .withIndex("by_vendor_user", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        const totalMembers = cards.length;
        const totalPoints = cards.reduce((acc, card) => acc + card.points, 0);

        // Calculate real trend: New members today
        const newToday = cards.filter(c => c._creationTime >= startOfDay).length;
        const trend = totalMembers > 0
            ? ((newToday / totalMembers) * 100).toFixed(1)
            : "0.0";

        // Distribution (Tiering logic for this view)
        const bronzeCount = cards.filter(c => c.points < 5000).length;
        const silverCount = cards.filter(c => c.points >= 5000 && c.points < 10000).length;
        const goldCount = cards.filter(c => c.points >= 10000).length;

        return {
            totalMembers,
            totalPoints,
            newToday,
            trend: `${newToday >= 0 ? '+' : ''}${trend}%`,
            tierDistribution: {
                bronze: bronzeCount,
                silver: silverCount,
                gold: goldCount,
            },
            // Mock redemptions for now as there's no redemptions table yet
            redemptions: Math.floor(totalMembers * 0.15)
        };
    },
});
