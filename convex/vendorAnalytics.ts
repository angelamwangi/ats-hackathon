import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getVendorOrders = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .order("desc")
            .collect();
    },
});

export const getVendorAIInsights = action({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args): Promise<any> => {
        // 1. Fetch sales data
        const orders = await ctx.runQuery(api.vendorAnalytics.getVendorOrders, { vendorId: args.vendorId });
        const products = await ctx.runQuery(api.products.getProducts, { vendorId: args.vendorId });

        // 2. Aggregate sales
        const salesMap: Record<string, number> = {};
        orders.forEach((order: any) => {
            order.items.forEach((item: any) => {
                salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
            });
        });

        const productStats = products.map((p: any) => ({
            name: p.name,
            category: p.category,
            currentStock: p.stock,
            price: p.price,
            totalSold: salesMap[p._id] || 0
        }));

        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a Retail Business Intelligence Analyst. Analyze the following sales data for a merchant's shop and provide strategic advice to maximize profit.
                
                Data (Product Stats):
                ${JSON.stringify(productStats)}
                
                Provide:
                1. "Hot Sellers": Items with high sales that should be restocked or promoted.
                2. "Dead Stock": Items with low sales and high stock that need clearing (e.g., via discounts).
                3. "Strategy": 3-4 bullet points on how to improve profit (e.g., cross-selling, pricing adjustments).
                
                Return the response as a valid JSON object with keys: "hotSellers", "deadStock", "strategy" (array of strings).
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json|```/g, "").trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("Gemini Analytics Error:", error);
            return {
                hotSellers: "Insufficient data for detailed analysis.",
                deadStock: "Insufficient data for detailed analysis.",
                strategy: ["Focus on gathering more sales data to unlock AI insights."]
            };
        }
    },
});
