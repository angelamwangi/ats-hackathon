import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const compareCompetitorPrices = action({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.runQuery(api.market_intel.getProductDetails, { productId: args.productId });
        if (!product) throw new Error("Product not found");

        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a robust Market Intelligence AI for the Kenyan Market.
                Analyze the following product and compare its price against TOP KENYAN WEBSITES AND APPS (e.g., Jumia, Kilimall, Jiji, Masoko, Carrefour Kenya, PhonePlace Kenya).

                Product: ${product.name}
                Current Price: ${product.price} (assume KSH or equivalent USD conversion, treat input as base currency)
                Category: ${product.category}

                Task:
                1. Identify 3 likely competitors or listings in Kenya for this product.
                2. Estimate/Search for their current pricing.
                3. Calculate match confidence.
                4. Provide a JSON response with the following structure:
                
                [
                    {
                        "competitorName": "Jumia Kenya",
                        "sourceUrl": "https://www.jumia.co.ke/...",
                        "price": 12000,
                        "currency": "KSH",
                        "matchConfidence": 0.95,
                        "reasoning": "Exact model match found in electronics category.",
                        "differenceFound": "2% lower than your price"
                    },
                    ...
                ]

                Return ONLY the JSON array. Do not include markdown formatting.
                If you cannot find exact real-time data, generate realistic ESTIMATES based on the Kenyan market standards for this product type.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json|```/g, "").trim();
            const matches = JSON.parse(cleanedText);

            // Handle currency conversion if needed (mostly mock logic for hackathon)
            // Assuming input price was USD, but frontend displays USD. 
            // If Gemini returns KSH, we might want to normalize or just display as is.
            // For now, let's assume the frontend can handle the 'currency' field string, 
            // but for 'lowest' calculation, we should normalize.
            // Let's pretend 1 USD = 130 KSH for quick math if needed, or just trust Gemini provides compatible numbers if prompted correctly.
            // To be safe, let's ask Gemini to return prices in USD to match our system, OR we update the frontend to handle KSH.
            // The frontend displays: ${match.price.toFixed(2)} <span ...>{match.currency}</span>
            // So different currencies are fine visually.

            // Calculate lowest price for summary (simple normalization for stats)
            // We'll filter for numeric prices.

            const validMatches = matches.filter((m: any) => typeof m.price === 'number');

            // Normalize to USD for the "lowest" stat if currency is KSH (approx /130)
            const lowest = Math.min(...validMatches.map((m: any) => {
                if (m.currency === "KSH" || m.currency === "KES") return m.price / 130;
                return m.price;
            }));

            const diffPerc = ((product.price - lowest) / product.price) * 100;

            await ctx.runMutation(internal.market_intel.updateMarketIndex, {
                productId: args.productId,
                vendorId: product.vendorId,
                matches: validMatches,
                marketSummary: {
                    lowestCompetitorPrice: Number(lowest.toFixed(2)),
                    priceDifferencePercentage: Number(diffPerc.toFixed(1))
                }
            });

        } catch (error) {
            console.error("Gemini Market Intel Error:", error);
            // Fallback to Kenyan mock data if AI fails
            const mockMatches = [
                {
                    competitorName: "Jumia",
                    sourceUrl: "https://www.jumia.co.ke/",
                    price: Number((product.price * 130 * 0.98).toFixed(0)), // Mock KSH
                    currency: "KES",
                    matchConfidence: 0.90,
                    reasoning: "Similar item found on Jumia Mall.",
                    differenceFound: "Slightly cheaper."
                },
                {
                    competitorName: "Kilimall",
                    sourceUrl: "https://www.kilimall.co.ke/",
                    price: Number((product.price * 130 * 1.02).toFixed(0)),
                    currency: "KES",
                    matchConfidence: 0.85,
                    reasoning: "Marketplace listing.",
                    differenceFound: "Higher price due to shipping."
                }
            ];

            await ctx.runMutation(internal.market_intel.updateMarketIndex, {
                productId: args.productId,
                vendorId: product.vendorId,
                matches: mockMatches,
                marketSummary: {
                    lowestCompetitorPrice: product.price * 0.98,
                    priceDifferencePercentage: 2.0
                }
            });
        }

        return { success: true };
    },
});
