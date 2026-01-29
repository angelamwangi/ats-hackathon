import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

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

        const url = "https://api.africastalking.com/version1/messaging";
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("to", args.to.join(","));
        params.append("message", args.message);

        try {
            console.log(`Sending SMS to: ${args.to.join(", ")}`);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "apiKey": apiKey
                },
                body: params
            });

            const result = await response.json();
            console.log("SMS API raw result:", result);

            // Africa's Talking specific success check
            const success = result?.SMSMessageData?.Recipients?.some((r: any) =>
                r.status === "Success" || r.status === "Sent"
            );

            if (!success) {
                console.error("SMS failed to send to any recipient:", result);
                return { success: false, error: "API rejected request", details: result };
            }

            return { success: true, result };
        } catch (error) {
            console.error("SMS fetch error:", error);
            return { success: false, error: String(error) };
        }
    }
});

export const executeSupplierDispatch = action({
    args: {
        orderId: v.id("orders"),
        supplierId: v.id("suppliers"),
        vendorId: v.id("vendors"),
        customerPhone: v.string(), // Pass from frontend for reliability
        vendorPhone: v.string(),   // Pass from frontend
        supplierPhone: v.string(), // Pass from frontend
        dropoffAddress: v.optional(v.string()), // New: dropoff address
    },
    handler: async (ctx, args) => {
        const { orderId, supplierId, vendorId, customerPhone, vendorPhone, supplierPhone, dropoffAddress } = args;

        // 1. Update Order Status in DB
        await ctx.runMutation(api.orders.updateOrderSupplier, {
            orderId,
            supplierId,
            status: "dispatched"
        });

        // 2. Create Delivery Record Assigned to Supplier
        // Mocking coordinates for demo
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
            cost: 0, // Fulfillment by supplier
        });

        // 3. Prepare Message
        const orderShortId = orderId.slice(-6).toUpperCase();
        const locationInfo = dropoffAddress ? ` at ${dropoffAddress}` : "";
        const message = `Retail Nexus: Order #${orderShortId} has been dispatched to you for fulfillment. Deliver to: ${customerPhone}${locationInfo}. Vendor: ${vendorPhone}.`;

        // 4. Send Bulk SMS
        const isPhone = (p?: string) => p && /^\+?[0-9]{7,15}$/.test(p.replace(/[\s-]/g, ""));
        const recipients = [customerPhone, vendorPhone, supplierPhone].filter(isPhone);

        console.log(`Recipients found: ${recipients.length}`);

        let smsResult: any = { success: true, message: "No recipients to notify" };
        if (recipients.length > 0) {
            smsResult = await ctx.runAction(api.notifications.sendBulkDispatchSMS, {
                to: recipients as string[],
                message: message
            });
        }

        return { success: true, sms: smsResult };
    }
});
