import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Helper to generate the Daraja Password
const getMpesaPassword = (shortCode: string, passkey: string, timestamp: string) => {
    return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
};

// Helper to get Timestamp in YYYYMMDDHHmmss format
const getTimestamp = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

export const initiateMpesaStkPush = action({
    args: {
        phoneNumber: v.string(), // Format: 254712345678
        amount: v.number(),
        orderId: v.optional(v.string()), // Optional internal order ID
    },
    handler: async (ctx, args) => {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const shortCode = process.env.MPESA_SHORTCODE || "174379"; // Sandbox default
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        if (!consumerKey || !consumerSecret || !passkey || !callbackUrl) {
            throw new Error("M-Pesa credentials not configured in environment variables.");
        }

        // 1. Get OAuth Token
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
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
