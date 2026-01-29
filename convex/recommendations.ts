import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getPersonalizedRecommendations = action({
    args: { userId: v.id("users") },
    handler: async (ctx, args): Promise<any> => {
        // 1. Fetch user's visit history
        const visits = await ctx.runQuery(api.recommendations.getUserVisits, { userId: args.userId });

        // 2. Fetch all products
        const allProducts = await ctx.runQuery(api.products.getProducts, {});

        if (visits.length === 0) {
            // Return top rated if no history
            return allProducts.sort((a: any, b: any) => (b.qualityRating || 0) - (a.qualityRating || 0)).slice(0, 3);
        }

        // 3. Prepare context for Gemini
        const visitedProductNames = visits.map((v: any) => v.productName).join(", ");
        const catalog = allProducts.map((p: any) => ({
            id: p._id,
            name: p.name,
            category: p.category,
            price: p.price,
            rating: p.qualityRating
        }));

        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a retail recommendation engine. Based on a user's browsing history, suggest the top 3 products they are most likely to buy from the provided catalog.
                
                Browsing History: ${visitedProductNames}
                
                Catalog:
                ${JSON.stringify(catalog)}
                
                Only return a valid JSON array of product IDs. No explanation.
                Example: ["id1", "id2", "id3"]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract IDs from response (Gemini sometimes adds markdown codes)
            const cleanedText = text.replace(/```json|```/g, "").trim();
            const recommendedIds = JSON.parse(cleanedText);

            return allProducts.filter((p: any) => recommendedIds.includes(p._id));
        } catch (error) {
            console.error("Gemini Recommendation Error:", error);
            // Fallback to simple category matching
            const lastCategory = (visits[0] as any)?.productCategory;
            return allProducts.filter((p: any) => p.category === lastCategory).slice(0, 3);
        }
    },
});

export const getUserVisits = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const visits = await ctx.db
            .query("productVisits")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(10);

        const visitsWithDetails = await Promise.all(
            visits.map(async (v: { productId: any; userId: any; timestamp: number }) => {
                const product = await ctx.db.get(v.productId) as any;
                return {
                    ...v,
                    productName: product?.name || "Unknown Product",
                    productCategory: product?.category || "General"
                };
            })
        );

        return visitsWithDetails;
    },
});
