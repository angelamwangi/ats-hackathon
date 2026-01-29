import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrder = mutation({
    args: {
        vendorId: v.id("vendors"),
        customerId: v.optional(v.id("users")),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            priceAtSale: v.number()
        })),
        totalAmount: v.number(),
        source: v.union(v.literal("pos"), v.literal("ecommerce")),
        offlineId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Check stock for each item
        for (const item of args.items) {
            const product = await ctx.db.get(item.productId);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product?.name ?? item.productId}`);
            }
        }

        // 2. Decrement stock
        for (const item of args.items) {
            const product = (await ctx.db.get(item.productId))!;
            await ctx.db.patch(item.productId, { stock: product.stock - item.quantity });
        }

        // 3. Create order
        const orderId = await ctx.db.insert("orders", {
            ...args,
            status: "completed",
        });

        // 4. Update Nexus Points
        if (args.customerId) {
            const user = await ctx.db.get(args.customerId);
            if (user) {
                const pointsEarned = Math.floor(args.totalAmount / 10);
                await ctx.db.patch(args.customerId, {
                    nexusPoints: (user.nexusPoints || 0) + pointsEarned
                });
            }
        }

        return orderId;
    },
});

// 4. Get User Orders
export const getMyOrders = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .filter((q) => q.eq(q.field("customerId"), args.userId))
            .order("desc")
            .collect();

        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const itemsWithDetails = await Promise.all(order.items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return { ...item, product };
            }));
            return { ...order, items: itemsWithDetails };
        }));

        return ordersWithDetails;
    },
});

export const getOrder = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) return null;

        const itemsWithDetails = await Promise.all(order.items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return { ...item, product };
        }));

        return { ...order, items: itemsWithDetails };
    }
});


