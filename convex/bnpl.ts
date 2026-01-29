import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPlan = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
        totalPrice: v.number(),
        planDuration: v.number(),
        paymentInterval: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
        installmentAmount: v.number(),
        startDate: v.number(),
    },
    handler: async (ctx, args) => {
        // Check for existing active plan
        const existing = await ctx.db
            .query("bnplOrders")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("productId"), args.productId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .first();

        if (existing) {
            throw new Error("You already have an active plan for this item.");
        }

        const id = await ctx.db.insert("bnplOrders", {
            ...args,
            amountPaid: 0,
            status: "active",
            nextPaymentDate: args.startDate, // First payment due immediately or on start date
        });
        return id;
    },
});

export const cancelPlan = mutation({
    args: { planId: v.id("bnplOrders") },
    handler: async (ctx, args) => {
        const plan = await ctx.db.get(args.planId);
        if (!plan) throw new Error("Plan not found");

        // In a real app, we might issue a refund to wallet here

        await ctx.db.patch(args.planId, {
            status: "cancelled"
        });
    },
});

export const getMyPlans = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const plans = await ctx.db
            .query("bnplOrders")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.neq(q.field("status"), "cancelled"))
            .collect();

        const plansWithProducts = await Promise.all(plans.map(async (plan) => {
            const product = await ctx.db.get(plan.productId);
            return { ...plan, product };
        }));

        return plansWithProducts;
    }
});

export const getPlan = query({
    args: { planId: v.id("bnplOrders") },
    handler: async (ctx, args) => {
        const plan = await ctx.db.get(args.planId);
        if (!plan) return null;
        const product = await ctx.db.get(plan.productId);
        return { ...plan, product };
    }
});

export const makePayment = mutation({
    args: {
        planId: v.id("bnplOrders"),
        amount: v.number()
    },
    handler: async (ctx, args) => {
        const plan = await ctx.db.get(args.planId);
        if (!plan) throw new Error("Plan not found");

        const remaining = plan.totalPrice - plan.amountPaid;

        // Ensure no overpayment
        if (args.amount > remaining) {
            throw new Error(`Amount exceeds remaining balance of $${remaining.toFixed(2)}`);
        }

        const newAmount = plan.amountPaid + args.amount;
        const isCompleted = newAmount >= plan.totalPrice; // Should be === given check above, but >= is safe

        await ctx.db.patch(args.planId, {
            amountPaid: newAmount,
            status: isCompleted ? "completed" : "active"
        });

        if (isCompleted) {
            const product = await ctx.db.get(plan.productId);
            if (product) {
                // Diminish stock
                if (product.stock > 0) {
                    await ctx.db.patch(plan.productId, { stock: product.stock - 1 });
                }

                await ctx.db.insert("orders", {
                    vendorId: product.vendorId,
                    customerId: plan.userId,
                    items: [{
                        productId: plan.productId,
                        quantity: 1,
                        priceAtSale: plan.totalPrice
                    }],
                    totalAmount: plan.totalPrice,
                    source: "ecommerce",
                    status: "pending"
                });

                // Update Nexus Points
                const user = await ctx.db.get(plan.userId);
                if (user) {
                    const pointsEarned = Math.floor(plan.totalPrice / 10);
                    await ctx.db.patch(plan.userId, {
                        nexusPoints: (user.nexusPoints || 0) + pointsEarned
                    });
                }
            }
        }

        return newAmount;
    }
});
