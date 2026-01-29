import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const compareCompetitorPrices = action({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.runQuery(api.market_intel.getProductDetails, { productId: args.productId });
        if (!product) throw new Error("Product not found");

        const mockMatches = [
            {
                competitorName: "Amazon",
                sourceUrl: "https://amazon.com/p/123",
                price: Number((product.price * 0.95).toFixed(2)),
                currency: "USD",
                matchConfidence: 0.99,
                reasoning: "Exact semantic match.",
                differenceFound: "5% lower than current price."
            },
            {
                competitorName: "Walmart",
                sourceUrl: "https://walmart.com/p/456",
                price: Number((product.price * 1.05).toFixed(2)),
                currency: "USD",
                matchConfidence: 0.95,
                reasoning: "Matching brand and model.",
                differenceFound: "Price is higher than local vendor."
            }
        ];

        const lowest = Math.min(...mockMatches.map((m: any) => m.price));
        const diffPerc = ((product.price - lowest) / product.price) * 100;

        await ctx.runMutation(internal.market_intel.updateMarketIndex, {
            productId: args.productId,
            vendorId: product.vendorId,
            matches: mockMatches,
            marketSummary: {
                lowestCompetitorPrice: lowest,
                priceDifferencePercentage: Number(diffPerc.toFixed(1))
            }
        });

        return { success: true };
    },
});
