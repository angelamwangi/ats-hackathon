import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

export const getDashboardMetrics = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        // Fetch all orders for this vendor
        const allOrders = await ctx.db
            .query("orders")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        // Fetch all products for this vendor
        const products = await ctx.db
            .query("products")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        // Fetch product visits
        const allVisits = await ctx.db
            .query("productVisits")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        // Calculate revenue metrics
        const calcRevenue = (orders: typeof allOrders) =>
            orders.reduce((sum, o) => sum + o.totalAmount, 0);

        const todayOrders = allOrders.filter(o => o._creationTime > oneDayAgo);
        const weekOrders = allOrders.filter(o => o._creationTime > sevenDaysAgo);
        const monthOrders = allOrders.filter(o => o._creationTime > thirtyDaysAgo);

        const todayRevenue = calcRevenue(todayOrders);
        const weekRevenue = calcRevenue(weekOrders);
        const monthRevenue = calcRevenue(monthOrders);
        const totalRevenue = calcRevenue(allOrders);

        // Previous period comparison (for % change)
        const prevWeekOrders = allOrders.filter(
            o => o._creationTime > sevenDaysAgo - 7 * 24 * 60 * 60 * 1000 &&
                o._creationTime <= sevenDaysAgo
        );
        const prevWeekRevenue = calcRevenue(prevWeekOrders);
        const weekChange = prevWeekRevenue > 0
            ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
            : 0;

        // Order metrics
        const orderCount = allOrders.length;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Customer metrics (unique customers)
        const uniqueCustomers = new Set(
            allOrders.filter(o => o.customerId).map(o => o.customerId)
        ).size;

        // Product performance (aggregate sales per product)
        const productSales: Record<string, { units: number; revenue: number }> = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { units: 0, revenue: 0 };
                }
                productSales[item.productId].units += item.quantity;
                productSales[item.productId].revenue += item.priceAtSale * item.quantity;
            });
        });

        // Top 5 products by revenue
        const topProducts = products
            .map(p => ({
                id: p._id,
                name: p.name,
                category: p.category,
                price: p.price,
                stock: p.stock,
                minStock: p.minStockThreshold,
                unitsSold: productSales[p._id]?.units || 0,
                revenue: productSales[p._id]?.revenue || 0,
                qualityRating: p.qualityRating,
                isLowStock: p.stock <= p.minStockThreshold,
                isHot: (productSales[p._id]?.units || 0) > 10,
                isCold: (productSales[p._id]?.units || 0) === 0 && p.stock > 0,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // Category breakdown
        const categoryStats: Record<string, { revenue: number; units: number; count: number }> = {};
        topProducts.forEach(p => {
            if (!categoryStats[p.category]) {
                categoryStats[p.category] = { revenue: 0, units: 0, count: 0 };
            }
            categoryStats[p.category].revenue += p.revenue;
            categoryStats[p.category].units += p.unitsSold;
            categoryStats[p.category].count += 1;
        });

        // Daily revenue for trend chart (last 30 days)
        const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
            const dayEnd = now - i * 24 * 60 * 60 * 1000;
            const dayOrders = allOrders.filter(
                o => o._creationTime > dayStart && o._creationTime <= dayEnd
            );
            const date = new Date(dayEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dailyRevenue.push({
                date,
                revenue: calcRevenue(dayOrders),
                orders: dayOrders.length,
            });
        }

        // Low stock alerts
        const lowStockProducts = topProducts.filter(p => p.isLowStock);

        // Average quality rating
        const avgQualityRating = products.length > 0
            ? products.reduce((sum, p) => sum + p.qualityRating, 0) / products.length
            : 0;

        return {
            revenue: {
                today: todayRevenue,
                week: weekRevenue,
                month: monthRevenue,
                total: totalRevenue,
                weekChange: Number(weekChange.toFixed(1)),
            },
            orders: {
                total: orderCount,
                today: todayOrders.length,
                week: weekOrders.length,
                avgValue: Number(avgOrderValue.toFixed(2)),
            },
            customers: {
                unique: uniqueCustomers,
            },
            products: {
                total: products.length,
                topProducts: topProducts.slice(0, 10),
                lowStock: lowStockProducts,
                avgQualityRating: Number(avgQualityRating.toFixed(1)),
            },
            categories: Object.entries(categoryStats).map(([name, stats]) => ({
                name,
                ...stats,
            })),

            trend: dailyRevenue,
            views: {
                total: allVisits.length,
                conversionRate: allVisits.length > 0 ? Number(((orderCount / allVisits.length) * 100).toFixed(1)) : 0
            }
        };
    },
});

// ============================================================================
// AI-POWERED COMPREHENSIVE ADVICE
// ============================================================================

export const getComprehensiveAIAdvice = action({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args): Promise<any> => {
        // Fetch dashboard metrics
        const metrics = await ctx.runQuery(api.vendorDashboard.getDashboardMetrics, {
            vendorId: args.vendorId,
        });

        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are a world-class Retail Business Intelligence Analyst. Analyze the following comprehensive sales data and provide strategic, actionable advice to help this vendor maximize their sales and profits.

## VENDOR DATA

### Revenue Metrics
- Today: $${metrics.revenue.today}
- This Week: $${metrics.revenue.week} (${metrics.revenue.weekChange >= 0 ? '+' : ''}${metrics.revenue.weekChange}% vs last week)
- This Month: $${metrics.revenue.month}
- All Time: $${metrics.revenue.total}

### Order Metrics
- Total Orders: ${metrics.orders.total}
- Average Order Value: $${metrics.orders.avgValue}

### Customer Metrics
- Unique Customers: ${metrics.customers.unique}

### Product Performance (Top 10)
${JSON.stringify(metrics.products.topProducts, null, 2)}

### Category Breakdown
${JSON.stringify(metrics.categories, null, 2)}

### Low Stock Alerts
${metrics.products.lowStock.length > 0 ? JSON.stringify(metrics.products.lowStock.map((p: any) => p.name)) : 'None'}

## REQUIRED OUTPUT

Provide your analysis as a valid JSON object with the following structure:
{
    "opportunityScore": <number 1-100>,
    "scoreReasoning": "<brief explanation of the score>",
    "immediateActions": [
        { "action": "<specific action>", "impact": "high|medium|low", "reason": "<why this matters>" }
    ],
    "thisWeek": [
        { "action": "<specific action>", "impact": "high|medium|low", "reason": "<why this matters>" }
    ],
    "thisMonth": [
        { "action": "<specific action>", "impact": "high|medium|low", "reason": "<why this matters>" }
    ],
    "insights": {
        "hotProducts": "<analysis of best performers>",
        "coldProducts": "<analysis of underperformers and what to do>",
        "categoryOpportunity": "<which category to focus on and why>",
        "pricingAdvice": "<any pricing optimizations>",
        "inventoryAdvice": "<stock management recommendations>"
    }
}

Be specific, actionable, and data-driven. Focus on quick wins and high-impact strategies.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json|```/g, "").trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("Gemini Analytics Error:", error);
            return {
                opportunityScore: 50,
                scoreReasoning: "Unable to perform detailed analysis. Gather more sales data.",
                immediateActions: [
                    { action: "Add more products to your catalog", impact: "high", reason: "More variety attracts more customers" },
                    { action: "Run your first promotion", impact: "medium", reason: "Promotions drive initial traction" },
                ],
                thisWeek: [
                    { action: "Set up your brand profile", impact: "medium", reason: "Professional branding builds trust" },
                ],
                thisMonth: [
                    { action: "Analyze your first month of sales data", impact: "high", reason: "Data-driven decisions improve performance" },
                ],
                insights: {
                    hotProducts: "Not enough data yet.",
                    coldProducts: "Not enough data yet.",
                    categoryOpportunity: "Focus on building your product catalog.",
                    pricingAdvice: "Start with competitive market pricing.",
                    inventoryAdvice: "Maintain 2-3 weeks of safety stock.",
                },
            };
        }
    },
});
