import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Initiate M-Pesa payment for a BNPL plan
 */
export const initiateBnplMpesaPayment = action({
    args: {
        planId: v.id("bnplOrders"),
        phoneNumber: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const consumerKey = process.env.MPESA_CONSUMER_KEY!;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
        const shortCode = process.env.MPESA_SHORTCODE!;
        const passkey = process.env.MPESA_PASSKEY!;
        const callbackUrl = process.env.MPESA_CALLBACK_URL!;

        // Sanitize phone number to E.164 format
        let phone = args.phoneNumber.replace(/\D/g, "");
        if (phone.startsWith("0")) {
            phone = "254" + phone.slice(1);
        }
        if (!phone.startsWith("254")) {
            if (phone.length === 9) phone = "254" + phone;
        }

        // 1. Get OAuth Token
        const auth = btoa(`${consumerKey}:${consumerSecret}`);
        const tokenResponse = await fetch(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: { Authorization: `Basic ${auth}` },
            }
        );
        const { access_token } = await tokenResponse.json();

        // 2. Initiate STK Push
        const timestamp = getTimestamp();
        const password = getMpesaPassword(shortCode, passkey, timestamp);

        const stkResponse = await fetch(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    BusinessShortCode: shortCode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: Math.round(args.amount),
                    PartyA: phone,
                    PartyB: shortCode,
                    PhoneNumber: phone,
                    CallBackURL: callbackUrl,
                    AccountReference: `BNPL-${args.planId}`,
                    TransactionDesc: "Save-to-Buy payment for Retail Nexus",
                }),
            }
        );

        const result = await stkResponse.json();

        // Link checkout ID to plan for callback tracking
        if (result.CheckoutRequestID) {
            await ctx.runMutation(api.bnpl_payments.linkBnplCheckout, {
                planId: args.planId,
                checkoutId: result.CheckoutRequestID,
                amount: args.amount,
            });
        }

        return result;
    },
});

/**
 * Link a BNPL plan to a checkout ID
 */
export const linkBnplCheckout = mutation({
    args: {
        planId: v.id("bnplOrders"),
        checkoutId: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("bnplCheckouts", {
            planId: args.planId,
            checkoutId: args.checkoutId,
            amount: args.amount,
            status: "pending",
            timestamp: Date.now(),
        });
    },
});

/**
 * Handle M-Pesa callback for BNPL payments
 */
export const handleBnplMpesaCallback = mutation({
    args: {
        checkoutId: v.string(),
        resultCode: v.number(),
        amount: v.optional(v.number()),
        mpesaReceiptNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Find the BNPL checkout record
        const checkout = await ctx.db
            .query("bnplCheckouts")
            .filter((q) => q.eq(q.field("checkoutId"), args.checkoutId))
            .first();

        if (!checkout) {
            console.warn("⚠️ BNPL callback received for unknown checkout:", args.checkoutId);
            return;
        }

        if (args.resultCode === 0) {
            // Payment successful - update plan
            const plan = await ctx.db.get(checkout.planId);
            if (!plan) {
                console.error("❌ Plan not found for checkout:", checkout.planId);
                return;
            }

            const newAmountPaid = plan.amountPaid + checkout.amount;
            const isCompleted = newAmountPaid >= plan.totalPrice;

            await ctx.db.patch(checkout.planId, {
                amountPaid: newAmountPaid,
                status: isCompleted ? "completed" : "active",
            });

            // Update checkout status
            await ctx.db.patch(checkout._id, {
                status: "completed",
                mpesaReceiptNumber: args.mpesaReceiptNumber,
            });

            // If completed, create order and update stock
            if (isCompleted) {
                const product = await ctx.db.get(plan.productId);
                if (product && product.stock > 0) {
                    await ctx.db.patch(plan.productId, { stock: product.stock - 1 });

                    await ctx.db.insert("orders", {
                        vendorId: product.vendorId,
                        customerId: plan.userId,
                        items: [{
                            productId: plan.productId,
                            quantity: 1,
                            priceAtSale: plan.totalPrice,
                        }],
                        totalAmount: plan.totalPrice,
                        source: "bnpl",
                        status: "pending",
                    });

                    // Update Nexus Points
                    const user = await ctx.db.get(plan.userId);
                    if (user) {
                        const pointsEarned = Math.floor(plan.totalPrice / 10);
                        await ctx.db.patch(plan.userId, {
                            nexusPoints: (user.nexusPoints || 0) + pointsEarned,
                        });
                    }
                }
            }

            console.log(`✅ BNPL payment confirmed for plan ${checkout.planId}: KSh ${checkout.amount}`);
        } else {
            // Payment failed or cancelled
            await ctx.db.patch(checkout._id, {
                status: "failed",
            });
            console.error(`❌ BNPL payment failed for plan ${checkout.planId}: Code ${args.resultCode}`);
        }
    },
});

// Helper functions
const getMpesaPassword = (shortCode: string, passkey: string, timestamp: string) => {
    return btoa(`${shortCode}${passkey}${timestamp}`);
};

const getTimestamp = () => {
    const date = new Date();
    return date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
};
