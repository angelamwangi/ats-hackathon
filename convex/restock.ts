import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getEssentialPurchases = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Fetch completed orders for the user
        const orders = await ctx.db
            .query("orders")
            .filter((q) => q.eq(q.field("customerId"), args.userId))
            .collect();

        // Filter and return unique product purchases with their timestamps
        const purchases: any[] = [];
        for (const order of orders) {
            for (const item of order.items) {
                const product = await ctx.db.get(item.productId);
                if (product?.predictedUsageMonths) {
                    purchases.push({
                        productId: item.productId,
                        productName: product.name,
                        predictedUsageMonths: product.predictedUsageMonths,
                        timestamp: order._creationTime,
                    });
                }
            }
        }
        return purchases;
    },
});

export const predictDepletion = action({
    args: { userId: v.id("users") },
    handler: async (ctx, args): Promise<any> => {
        const purchases = await ctx.runQuery(getEssentialPurchases as any, { userId: args.userId });

        const now = Date.now();
        const alerts = purchases.filter((p: any) => {
            const usageDurationMs = p.predictedUsageMonths * 30 * 24 * 60 * 60 * 1000;
            const depletionTime = p.timestamp + usageDurationMs;
            const eightyPercentTime = p.timestamp + (usageDurationMs * 0.8);

            // Return if we are between 80% and 100% depleted
            return now >= eightyPercentTime && now < depletionTime;
        });

        return alerts.map((a: any) => ({
            productId: a.productId,
            message: `You're likely 80% through your ${a.productName}. Order now to ensure you don't run out!`
        }));
    },
});
