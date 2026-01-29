import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getVendorByOwnerId = query({
    args: { ownerId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("vendors")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .unique();
    },
});

export const updateVendorBranding = mutation({
    args: {
        vendorId: v.id("vendors"),
        shopName: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        bannerUrl: v.optional(v.string()),
        brandConfig: v.object({
            primaryColor: v.string(),
            secondaryColor: v.string(),
            typography: v.optional(v.string()),
        }),
        contactInfo: v.optional(v.object({
            supportEmail: v.optional(v.string()),
            whatsappNumber: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const { vendorId, ...updates } = args;
        await ctx.db.patch(vendorId, {
            ...updates,
            onboardingStatus: "completed"
        });
    },
});
