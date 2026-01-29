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

export const handleMpesaCallback = mutation({
    args: {
        body: v.any(), // The payload from Safaricom
    },
    handler: async (ctx, args) => {
        const { Body } = args.body;
        const { stkCallback } = Body;

        if (stkCallback.ResultCode === 0) {
            // Success! 
            // In a real app, we'd find the order by CheckoutRequestID and update it
            console.log("M-Pesa Payment Successful:", stkCallback.CheckoutRequestID);

            // Logic to update orders/loyalty would go here
        } else {
            console.error("M-Pesa Payment Failed:", stkCallback.ResultDesc);
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
