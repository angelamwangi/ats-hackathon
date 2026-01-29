import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Helper to generate the Daraja Password
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

export const initiateMpesaStkPush = action({
    args: {
        phoneNumber: v.string(),
        amount: v.number(),
        orderId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const consumerKey = process.env.MPESA_CONSUMER_KEY!;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
        const shortCode = process.env.MPESA_SHORTCODE!;
        const passkey = process.env.MPESA_PASSKEY!;
        const callbackUrl = process.env.MPESA_CALLBACK_URL!;

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
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", // Sandbox endpoint
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
                    PartyA: args.phoneNumber,
                    PartyB: shortCode,
                    PhoneNumber: args.phoneNumber,
                    CallBackURL: callbackUrl,
                    AccountReference: args.orderId || "RetailNexusOrder",
                    TransactionDesc: "Payment for goods at Retail Nexus",
                }),
            }
        );

        const result = await stkResponse.json();

        // Return CheckoutID or ResponseCode for the UI to track
        return result;
    },
});

// Link an order to a checkout ID to track payment
export const linkOrderToCheckout = mutation({
    args: {
        orderId: v.id("orders"),
        checkoutId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, { mpesaCheckoutId: args.checkoutId });
    },
});

export const handleMpesaCallback = mutation({
    args: {
        body: v.any(), // The payload from Safaricom
    },
    handler: async (ctx, args) => {
        const { Body } = args.body;
        const { stkCallback } = Body;

        if (stkCallback.ResultCode === 0) {
            // 1. Find the order linked to this checkout
            const order = await ctx.db
                .query("orders")
                .withIndex("by_checkoutId", (q) => q.eq("mpesaCheckoutId", stkCallback.CheckoutRequestID))
                .unique();

            if (order) {
                // 2. Update Order Status
                await ctx.db.patch(order._id, { status: "completed" });

                // 3. Deduct Stock for each item
                for (const item of order.items) {
                    const product = await ctx.db.get(item.productId);
                    if (product) {
                        const newStock = Math.max(0, product.stock - item.quantity);
                        await ctx.db.patch(product._id, { stock: newStock });
                    }
                }

                // 4. Record the Payment
                const mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
                    (i: any) => i.Name === "MpesaReceiptNumber"
                )?.Value;
                const phoneNumber = stkCallback.CallbackMetadata?.Item?.find(
                    (i: any) => i.Name === "PhoneNumber"
                )?.Value;

                await ctx.db.insert("payments", {
                    orderId: order._id,
                    vendorId: order.vendorId,
                    amount: order.totalAmount,
                    method: "mpesa",
                    status: "completed",
                    transactionId: mpesaReceiptNumber || stkCallback.CheckoutRequestID,
                    phoneNumber: String(phoneNumber || ""),
                    timestamp: Date.now(),
                });

                console.log(`✅ Order ${order._id} verified and stock updated via M-Pesa callback.`);
            } else {
                console.warn("⚠️ Callback received for unlinked CheckoutRequestID:", stkCallback.CheckoutRequestID);
            }
        } else {
            console.error("❌ M-Pesa Payment Failed:", stkCallback.ResultDesc);
        }
    },
});

export const recordPayment = mutation({
    args: {
        orderId: v.optional(v.id("orders")),
        vendorId: v.id("vendors"),
        amount: v.number(),
        method: v.union(v.literal("cash"), v.literal("mpesa")),
        status: v.union(v.literal("completed"), v.literal("failed"), v.literal("pending")),
        transactionId: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const paymentId = await ctx.db.insert("payments", {
            ...args,
            timestamp: Date.now(),
        });
        return paymentId;
    },
});

export const getVendorPayments = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("payments")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .order("desc")
            .collect();
    },
});
