import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const processMpesaCheckout = mutation({
    args: {
        userId: v.id("users"),
        phoneNumber: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Get User's Cart
        const cartItems = await ctx.db
            .query("carts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (cartItems.length === 0) {
            throw new Error("Cart is empty");
        }

        // 2. Calculate Total & Group by Vendor
        // NOTE: In a real app we might create multiple orders if items are from different vendors
        // For simplicity here, we'll assume they might be mixed but we create one order per vendor?
        // Or simpler: just create one order if we assume single vendor context.
        // Let's group by vendor.

        const vendorOrders = new Map<string, { items: any[], total: number, vendorId: string }>();

        for (const item of cartItems) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            if (!vendorOrders.has(product.vendorId)) {
                vendorOrders.set(product.vendorId, { items: [], total: 0, vendorId: product.vendorId });
            }

            const entry = vendorOrders.get(product.vendorId)!;
            entry.items.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtSale: product.price,
            });
            entry.total += product.price * item.quantity;
        }

        const createdOrderIds = [];

        // 3. Process Per Vendor
        for (const [vendorId, data] of vendorOrders.entries()) {

            // Mock M-Pesa "Verification"
            const mpesaReceipt = `MPESA-${Math.random().toString(36).substring(7).toUpperCase()}`;

            // Create Order
            const orderId = await ctx.db.insert("orders", {
                vendorId: vendorId as any,
                customerId: args.userId,
                items: data.items,
                totalAmount: data.total,
                source: "ecommerce",
                status: "pending", // OR "completed" if we assume instant payment
                mpesaCheckoutId: mpesaReceipt,
            });

            // Record Payment
            await ctx.db.insert("payments", {
                orderId: orderId,
                vendorId: vendorId as any,
                amount: data.total,
                method: "mpesa",
                status: "completed", // Mocking success
                transactionId: mpesaReceipt,
                phoneNumber: args.phoneNumber,
                timestamp: Date.now(),
            });

            createdOrderIds.push(orderId);
        }

        // 4. Clear Cart
        for (const item of cartItems) {
            await ctx.db.delete(item._id);
        }

        return { success: true, orderIds: createdOrderIds, message: "Orders processed successfully" };
    },
});
