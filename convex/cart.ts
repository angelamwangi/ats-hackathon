import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToCart = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("carts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("productId"), args.productId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                quantity: existing.quantity + args.quantity,
            });
            return existing._id;
        }

        return await ctx.db.insert("carts", {
            userId: args.userId,
            productId: args.productId,
            quantity: args.quantity,
        });
    },
});

export const removeFromCart = mutation({
    args: { cartId: v.id("carts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.cartId);
    },
});

export const updateQuantity = mutation({
    args: { cartId: v.id("carts"), quantity: v.number() },
    handler: async (ctx, args) => {
        if (args.quantity <= 0) {
            await ctx.db.delete(args.cartId);
        } else {
            await ctx.db.patch(args.cartId, { quantity: args.quantity });
        }
    },
});

export const getCart = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("carts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return { ...item, product };
            })
        );

        return enrichedItems;
    },
});
