import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleWishlist = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", args.userId).eq("productId", args.productId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
            return false; // Removed
        } else {
            await ctx.db.insert("wishlist", {
                userId: args.userId,
                productId: args.productId,
            });
            return true; // Added
        }
    },
});

export const getWishlist = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const wishlistItems = await ctx.db
            .query("wishlist")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // Return set of product IDs for efficient O(1) lookup on frontend
        return wishlistItems.map(item => item.productId);
    },
});
