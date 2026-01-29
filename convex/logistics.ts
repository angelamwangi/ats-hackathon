import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Vendor Requests Delivery
export const requestDelivery = mutation({
    args: {
        orderId: v.id("orders"),
        vendorId: v.id("vendors"),
        pickup: v.object({ lat: v.number(), lng: v.number(), address: v.string() }),
        dropoff: v.object({ lat: v.number(), lng: v.number(), address: v.string() }),
        cost: v.number(),
        estimatedDuration: v.optional(v.number()),
        supplierId: v.optional(v.id("suppliers")), // New field
    },
    handler: async (ctx, args) => {
        // Check if delivery already exists for this order
        const existing = await ctx.db
            .query("deliveries")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .first();

        if (existing) {
            // Update existing instead of throwing?
            // Actually, keep it for strictness or patch it.
            return existing._id;
        }

        const deliveryId = await ctx.db.insert("deliveries", {
            orderId: args.orderId,
            vendorId: args.vendorId,
            supplierId: args.supplierId,
            status: args.supplierId ? "assigned" : "pending",
            pickupLocation: args.pickup,
            dropoffLocation: args.dropoff,
            cost: args.cost,
            estimatedDuration: args.estimatedDuration,
        });

        return deliveryId;
    },
});

// 2. Rider: Get Available Deliveries
export const getAvailableDeliveries = query({
    args: {}, // Could add location filter later
    handler: async (ctx) => {
        // In a real app, use geospatial query to find nearby
        // For now, return all pending
        return await ctx.db
            .query("deliveries")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .order("desc")
            .collect();
    },
});

// 3. Rider: Accept Delivery
export const acceptDelivery = mutation({
    args: {
        deliveryId: v.id("deliveries"),
        riderId: v.id("users"), // Should match authenticated user
    },
    handler: async (ctx, args) => {
        const delivery = await ctx.db.get(args.deliveryId);
        if (!delivery) throw new Error("Delivery not found");
        if (delivery.status !== "pending") throw new Error("Delivery already accepted");

        await ctx.db.patch(args.deliveryId, {
            riderId: args.riderId,
            status: "assigned",
        });

        return true;
    },
});

// 4. Rider: Update Location & Status
export const updateDeliveryStatus = mutation({
    args: {
        deliveryId: v.id("deliveries"),
        status: v.union(v.literal("picked_up"), v.literal("in_transit"), v.literal("delivered"), v.literal("cancelled")),
        location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    },
    handler: async (ctx, args) => {
        const delivery = await ctx.db.get(args.deliveryId);
        if (!delivery) throw new Error("Delivery not found");

        const updates: any = { status: args.status };

        // If delivering, maybe update order status?

        await ctx.db.patch(args.deliveryId, updates);

        // Also update Rider's current location in users table
        if (delivery.riderId && args.location) {
            await ctx.db.patch(delivery.riderId, {
                currentLocation: args.location,
                isAvailable: args.status === "delivered" || args.status === "cancelled" ? true : false,
            });

            // Update delivery route coordinates (append) if needed for history
            // Not strictly necessary for live tracking if we poll rider location
        }
    },
});

// 5. Rider: Update Location (Background)
export const updateRiderLocation = mutation({
    args: {
        riderId: v.id("users"),
        location: v.object({ lat: v.number(), lng: v.number() }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.riderId, {
            currentLocation: args.location
        });
    }
});

// 6. Customer/Vendor: Track Delivery
export const getDelivery = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const delivery = await ctx.db
            .query("deliveries")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .first();

        if (!delivery) return null;

        // Get Rider Details (including location)
        let rider = null;
        if (delivery.riderId) {
            rider = await ctx.db.get(delivery.riderId);
        }

        return {
            ...delivery,
            rider: rider ? {
                name: rider.name,
                currentLocation: rider.currentLocation,
                phone: "0712345678" // Mock or add to schema
            } : null
        };
    },
});

export const getMyDeliveries = query({
    args: { riderId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("deliveries")
            .withIndex("by_rider", (q) => q.eq("riderId", args.riderId))
            .order("desc")
            .collect();
    }
});
