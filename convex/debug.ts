import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserDebugInfo = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const users = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .collect();

        return {
            count: users.length,
            users: users,
        };
    },
});

export const cleanupDuplicateUsers = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const users = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .collect();

        if (users.length <= 1) return { status: "No duplicates need cleanup" };

        // Keep the one with the most data or the most recent?
        // Assuming the first one is fine, or the one with a role.
        // We'll keep the first one and delete the rest.
        const [keep, ...remove] = users;

        for (const user of remove) {
            await ctx.db.delete(user._id);
        }

        return { status: `Removed ${remove.length} duplicates`, kept: keep._id };
    }
});
