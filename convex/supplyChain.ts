import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// 1. Demand Forecaster (SMA Logic)
export const getDemandForecast = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found");

        // Period: Last 30 days of orders
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        // Find all orders containing this product for the vendor
        const vendorOrders = await ctx.db
            .query("orders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", product.vendorId))
            .collect();

        // Calculate daily average sales
        let totalSold = 0;
        const relevantOrders = vendorOrders.filter(o => o._creationTime > thirtyDaysAgo);

        relevantOrders.forEach(order => {
            const item = order.items.find(i => i.productId === args.productId);
            if (item) totalSold += item.quantity;
        });

        const dailyAvg = totalSold / 30;
        const forecast30Days = dailyAvg * 30;
        const daysRemaining = dailyAvg > 0 ? product.stock / dailyAvg : 999;

        return {
            productId: args.productId,
            name: product.name,
            currentStock: product.stock,
            dailyAvg: dailyAvg.toFixed(2),
            forecast30Days: Math.ceil(forecast30Days),
            daysUntilDepletion: Math.floor(daysRemaining),
            isAtRisk: daysRemaining < 7 // Risk if less than 7 days left
        };
    },
});

// 2. Supplier & PO Logic
export const generatePurchaseOrder = mutation({
    args: {
        vendorId: v.id("vendors"),
        supplierId: v.id("suppliers"),
        items: v.array(v.object({ productId: v.id("products"), quantity: v.number(), expectedPrice: v.number() })),
    },
    handler: async (ctx, args) => {
        const totalCost = args.items.reduce((acc, item) => acc + (item.expectedPrice * item.quantity), 0);

        return await ctx.db.insert("purchaseOrders", {
            vendorId: args.vendorId,
            supplierId: args.supplierId,
            items: args.items,
            status: "draft",
            totalCost,
        });
    },
});

export const confirmAndSendPO = action({
    args: { poId: v.id("purchaseOrders") },
    handler: async (ctx, args) => {
        const po = await ctx.runQuery(api.supplyChain.getPO, { poId: args.poId });
        if (!po) throw new Error("PO not found");

        // Update status to 'sent'
        await ctx.runMutation(api.supplyChain.updatePOStatus, { poId: args.poId, status: "sent" });

        // Mock automated notification (WhatsApp/Email)
        console.log(`[SupplyBridge] PO #${args.poId} sent to supplier ${po.supplierName} (${po.supplierEmail})`);

        return { success: true, message: "PO sent via SupplyBridge" };
    },
});

// Helpers
export const getPO = query({
    args: { poId: v.id("purchaseOrders") },
    handler: async (ctx, args) => {
        const po = await ctx.db.get(args.poId);
        if (!po) return null;
        const supplier = await ctx.db.get(po.supplierId);
        return { ...po, supplierName: supplier?.name, supplierEmail: supplier?.contactEmail };
    },
});

export const updatePOStatus = mutation({
    args: { poId: v.id("purchaseOrders"), status: v.union(v.literal("draft"), v.literal("sent"), v.literal("received"), v.literal("cancelled")) },
    handler: async (ctx, args) => {
        const patch: any = { status: args.status };
        if (args.status === "sent") patch.sentAt = Date.now();
        if (args.status === "received") patch.receivedAt = Date.now();
        await ctx.db.patch(args.poId, patch);
    },
});

// 3. Batch Tracking (FIFO Logic)
export const addStockBatch = mutation({
    args: {
        productId: v.id("products"),
        vendorId: v.id("vendors"),
        batchId: v.string(),
        expiryDate: v.number(),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // Add to batch tracking
        await ctx.db.insert("inventoryBatches", {
            productId: args.productId,
            vendorId: args.vendorId,
            batchId: args.batchId,
            expiryDate: args.expiryDate,
            initialQuantity: args.quantity,
            remainingQuantity: args.quantity,
            receivedAt: Date.now(),
        });

        // Update main product stock
        const product = await ctx.db.get(args.productId);
        if (product) {
            await ctx.db.patch(args.productId, {
                stock: product.stock + args.quantity
            });
        }
    },
});

export const getExpiryAlerts = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const now = Date.now();
        const thirtyDaysAhead = now + 30 * 24 * 60 * 60 * 1000;

        const batches = await ctx.db
            .query("inventoryBatches")
            .withIndex("by_vendor_expiry", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) => q.gt(q.field("remainingQuantity"), 0))
            .collect();

        return batches
            .filter(b => b.expiryDate < thirtyDaysAhead)
            .map(b => ({
                ...b,
                daysUntilExpiry: Math.floor((b.expiryDate - now) / (24 * 60 * 60 * 1000)),
                isExpired: b.expiryDate < now
            }));
    },
});

// 4. Supplier Registration
export const registerSupplier = mutation({
    args: {
        vendorId: v.id("vendors"),
        name: v.string(),
        contactEmail: v.string(),
        contactPhone: v.string(),
        category: v.string(),
        leadTimeDays: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("suppliers", {
            vendorId: args.vendorId,
            name: args.name,
            contactEmail: args.contactEmail,
            contactPhone: args.contactPhone,
            category: args.category,
            leadTimeDays: args.leadTimeDays,
            reliabilityScore: 100, // Initial perfect score
        });
    },
});

export const getSuppliers = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("suppliers")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();
    },
});

// 5. Automated Stock Check (for Crons)
export const checkAllProductsStock = action({
    args: {},
    handler: async (ctx) => {
        console.log("[Cron] Running hourly stock check...");
        // Logic to notify vendors or auto-draft POs would go here
    },
});

// 6. POS Intelligence (FIFO)
export const getFifoBatch = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventoryBatches")
            .withIndex("by_product", (q) => q.eq("productId", args.productId))
            .filter((q) => q.gt(q.field("remainingQuantity"), 0))
            .collect();
    },
});

// 7. Supply Chain Visibility
export const getActivePOsByVendor = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("purchaseOrders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) => q.eq(q.field("status"), "sent"))
            .collect();
    },
});
