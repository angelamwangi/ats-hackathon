import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("vendor"), v.literal("customer")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user !== null) {
            return user._id;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            role: args.role,
            walletBalance: 0,
            nexusPoints: 0,
        });

        if (args.role === "vendor") {
            await ctx.db.insert("vendors", {
                ownerId: userId,
                shopName: `${args.name}'s Shop`,
                isApproved: true, // Auto-approve for hackathon demo
                onboardingStatus: "pending",
                loyaltyConfig: { pointsPerDollar: 1 },
            });
        }

        return userId;
    },
});

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});
