import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProducts = query({
    args: { vendorId: v.optional(v.id("vendors")) },
    handler: async (ctx, args) => {
        let products;
        if (args.vendorId) {
            products = await ctx.db
                .query("products")
                .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId!))
                .collect();
        } else {
            products = await ctx.db.query("products").collect();
        }

        return await Promise.all(products.map(async (p) => ({
            ...p,
            images: await Promise.all((p.images || []).map(async (img) => {
                if (img.startsWith("http")) return img;
                return await ctx.storage.getUrl(img) || img;
            }))
        })));
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const addProduct = mutation({
    args: {
        vendorId: v.id("vendors"),
        name: v.string(),
        price: v.number(),
        stock: v.number(),
        minStockThreshold: v.number(),
        category: v.string(),
        qualityRating: v.number(),
        images: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("products", args);
    },
});

export const updateStock = mutation({
    args: { productId: v.id("products"), quantityChange: v.number() },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);
        if (!product) throw new Error("Product not found");

        const newStock = product.stock + args.quantityChange;
        await ctx.db.patch(args.productId, { stock: newStock });

        return newStock;
    },
});

export const updateProductPrice = mutation({
    args: { productId: v.id("products"), price: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.productId, { price: args.price });
    },
});

export const logProductVisit = mutation({
    args: { productId: v.id("products"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);
        await ctx.db.insert("productVisits", {
            productId: args.productId,
            userId: args.userId,
            vendorId: product?.vendorId,
            timestamp: Date.now(),
        });
    },
});
