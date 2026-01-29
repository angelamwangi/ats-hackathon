import { v } from "convex/values";
import { internalAction, query } from "./_generated/server";
import { api } from "./_generated/api";

export const sendEngagementNudge = internalAction({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // 1. Fetch user's most viewed category
        const visits = await ctx.runQuery(api.recommendations.getUserVisits, { userId: args.userId });

        if (visits.length === 0) return;

        const categories = visits.map((v: any) => v.productCategory);
        const topCategory = categories.sort((a: any, b: any) =>
            categories.filter((v: any) => v === a).length - categories.filter((v: any) => v === b).length
        ).pop();

        // 2. Find a "Value Leader" in that category (e.g., best price or newest)
        const products = await ctx.runQuery(api.products.getProducts, {});
        const categoryDeal = products
            .filter((p: any) => p.category === topCategory)
            .sort((a: any, b: any) => a.price - b.price)[0];

        if (categoryDeal) {
            console.log(`[NUDGE] Sending alert to user ${args.userId}: The ${categoryDeal.name} you might like in ${topCategory} is only $${categoryDeal.price}!`);
            // In a real app, integrate with Twilio/Resend here
        }
    },
});
