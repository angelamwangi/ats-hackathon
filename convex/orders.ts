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
        paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("mpesa"))),
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
            vendorId: args.vendorId,
            customerId: args.customerId,
            items: args.items,
            totalAmount: args.totalAmount,
            source: args.source,
            offlineId: args.offlineId,
            status: "completed",
        });

        // 3b. Record Payment
        if (args.paymentMethod) {
            await ctx.db.insert("payments", {
                orderId: orderId,
                vendorId: args.vendorId,
                amount: args.totalAmount,
                method: args.paymentMethod,
                status: "completed",
                timestamp: Date.now(),
            });
        }

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

export const getVendorOrders = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .order("desc")
            .collect();

        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const itemsWithDetails = await Promise.all(order.items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return { ...item, product };
            }));

            // Fetch Customer details
            const customer = order.customerId ? await ctx.db.get(order.customerId) : null;

            // Fetch Payment details (for phone number if user doesn't have one)
            const payment = await ctx.db
                .query("payments")
                .withIndex("by_order", (q) => q.eq("orderId", order._id))
                .first();

            // Fetch Courier/Delivery details
            const delivery = await ctx.db
                .query("deliveries")
                .withIndex("by_order", (q) => q.eq("orderId", order._id))
                .first();

            // Fetch Supplier details if assigned
            const supplier = order.supplierId ? await ctx.db.get(order.supplierId) : null;

            return {
                ...order,
                items: itemsWithDetails,
                delivery,
                customerPhone: customer?.phone || payment?.phoneNumber || "Not provided",
                customerName: customer?.name || "Guest",
                supplier,
            };
        }));

        return ordersWithDetails;
    },
});

export const checkout = mutation({
    args: {
        userId: v.id("users"),
        paymentMethod: v.union(v.literal("cash"), v.literal("mpesa")),
        phoneNumber: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // 1. Get Cart
        const cartItems = await ctx.db
            .query("carts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (cartItems.length === 0) throw new Error("Cart is empty");

        // 2. Group by Vendor
        const ordersByVendor = new Map<string, any[]>();

        for (const item of cartItems) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            const vendorId = product.vendorId;
            if (!ordersByVendor.has(vendorId)) {
                ordersByVendor.set(vendorId, []);
            }
            ordersByVendor.get(vendorId)!.push({ ...item, product });
        }

        const orderIds = [];

        // 3. Create Order for each Vendor
        for (const [vendorId, items] of ordersByVendor.entries()) {
            const orderItems = items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                priceAtSale: i.product.price
            }));

            const totalAmount = items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

            // Check stock
            for (const item of items) {
                if (item.product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.product.name}`);
                }
            }

            // Decrement stock
            for (const item of items) {
                await ctx.db.patch(item.productId, { stock: item.product.stock - item.quantity });
            }

            const orderId = await ctx.db.insert("orders", {
                vendorId: vendorId as any,
                customerId: args.userId,
                items: orderItems,
                totalAmount,
                source: "ecommerce",
                status: "completed", // Assume success for demo
            });

            await ctx.db.insert("payments", {
                orderId: orderId,
                vendorId: vendorId as any,
                amount: totalAmount,
                method: args.paymentMethod,
                status: "completed",
                timestamp: Date.now(),
                phoneNumber: args.phoneNumber
            });

            // Update Points
            const pointsEarned = Math.floor(totalAmount / 10);
            const user = await ctx.db.get(args.userId);
            if (user) {
                await ctx.db.patch(args.userId, { nexusPoints: (user.nexusPoints || 0) + pointsEarned });
            }

            orderIds.push(orderId);
        }

        // 4. Clear Cart
        for (const item of cartItems) {
            await ctx.db.delete(item._id);
        }

        return orderIds;
    },
});

export const updateOrderSupplier = mutation({
    args: {
        orderId: v.id("orders"),
        supplierId: v.id("suppliers"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, {
            supplierId: args.supplierId,
            status: args.status,
        });
    },
});


