import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import AfricasTalking from "africastalking";

const sanitizePhoneNumber = (phone: string) => {
    // Remove any non-digits
    let cleaned = phone.replace(/\D/g, "");

    // If it starts with 0, replace with 254 (Kenya default)
    if (cleaned.startsWith("0")) {
        cleaned = "254" + cleaned.slice(1);
    }

    // Ensure it has a + prefix for E.164
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

export const sendSMS = action({
    args: {
        to: v.array(v.string()),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const username = process.env.AT_USERNAME || "sandbox";
        const apiKey = process.env.AT_API_KEY;

        if (!apiKey) {
            console.error("AT_API_KEY not found");
            return { success: false, error: "API Key missing" };
        }

        const at = AfricasTalking({ username, apiKey });
        const sms = at.SMS;

        const sanitizedRecipients = args.to.map(sanitizePhoneNumber).filter(p => p.length > 7);

        if (sanitizedRecipients.length === 0) {
            return { success: false, error: "No valid recipients" };
        }

        try {
            const result = await sms.send({
                to: sanitizedRecipients,
                message: args.message,
                enqueue: true
            }) as any;
            return { success: true, result };
        } catch (error) {
            console.error("SMS SDK error:", error);
            return { success: false, error: String(error) };
        }
    }
});

export const sendBulkDispatchSMS = action({
    args: {
        to: v.array(v.string()),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const username = process.env.AT_USERNAME || "sandbox";
        const apiKey = process.env.AT_API_KEY;

        if (!apiKey) {
            console.error("AT_API_KEY not found");
            return { success: false, error: "API Key missing" };
        }

        const at = AfricasTalking({ username, apiKey });
        const sms = at.SMS;

        try {
            console.log(`Sending SDK SMS to: ${args.to.join(", ")}`);
            const result = await sms.send({
                to: args.to,
                message: args.message,
                enqueue: true
            }) as any;

            console.log("SMS SDK result:", result);

            // Access the recipients list defensively
            const recipients = result?.SMSMessageData?.Recipients || result?.Recipients;
            const success = recipients?.some((r: any) =>
                r.status === "Success" || r.status === "Sent"
            );

            if (!success) {
                return { success: false, error: "SDK rejected/failed request", details: result };
            }

            return { success: true, result };
        } catch (error) {
            console.error("SMS SDK error:", error);
            return { success: false, error: String(error) };
        }
    }
});

/**
 * Enhanced action to handle tailored messaging for all stakeholders during dispatch.
 */
export const executeSupplierDispatch = action({
    args: {
        orderId: v.id("orders"),
        supplierId: v.id("suppliers"),
        vendorId: v.id("vendors"),
        customerPhone: v.string(),
        vendorPhone: v.string(),
        supplierPhone: v.string(),
        dropoffAddress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { orderId, supplierId, vendorId, customerPhone, vendorPhone, supplierPhone, dropoffAddress } = args;

        // 1. Update Order Status in DB
        await ctx.runMutation(api.orders.updateOrderSupplier, {
            orderId,
            supplierId,
            status: "dispatched"
        });

        // 2. Create Delivery Record
        const pickupCoords = { lat: -1.2921, lng: 36.8219, address: "Vendor Store" };
        const dropoffCoords = {
            lat: -1.3000,
            lng: 36.8500,
            address: dropoffAddress || "Customer Location"
        };

        await ctx.runMutation(api.logistics.requestDelivery, {
            orderId,
            vendorId,
            supplierId,
            pickup: pickupCoords,
            dropoff: dropoffCoords,
            cost: 0,
        });

        const orderShortId = orderId.slice(-6).toUpperCase();
        const locationInfo = dropoffAddress ? ` at ${dropoffAddress}` : "";

        // 3. Define Tailored Messages
        const messages = [
            {
                to: [customerPhone],
                message: `Hi! Your Retail Nexus Order #${orderShortId} is on the way via our partner. Contact supplier at ${supplierPhone} for updates. Delivery to: ${locationInfo || "your registered address"}.`
            },
            {
                to: [supplierPhone],
                message: `Nexus Fulfillment Req: Order #${orderShortId}. Deliver to ${customerPhone}${locationInfo}. Vendor Contact: ${vendorPhone}. Please confirm once delivered.`
            },
            {
                to: [vendorPhone],
                message: `Dispatch Confirmed: Order #${orderShortId} handed to supplier. Customer notified.`
            }
        ];

        // 4. Send Tailored SMS via SDK
        const username = process.env.AT_USERNAME || "sandbox";
        const apiKey = process.env.AT_API_KEY;
        const isPhone = (p?: string) => p && /^\+?[0-9]{7,15}$/.test(p.replace(/[\s-]/g, ""));

        if (!apiKey) return { success: true, db: "updated", sms: "skipped (no key)" };

        const at = AfricasTalking({ username, apiKey });
        const sms = at.SMS;

        const results = await Promise.all(messages.map(async (m) => {
            const validRecipients = m.to.map(sanitizePhoneNumber).filter(p => p.length > 7);
            if (validRecipients.length === 0) return { success: false, error: "Invalid phone" };

            try {
                const res = await sms.send({
                    to: validRecipients,
                    message: m.message,
                    enqueue: true
                }) as any;
                return { success: true, res };
            } catch (err) {
                return { success: false, error: String(err) };
            }
        }));

        console.log("Tailored SMS Results:", results);

        return { success: true, results };
    }
});
