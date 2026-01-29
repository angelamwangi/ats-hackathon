"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function syncUserRole(userId: string, role: "admin" | "vendor" | "customer") {
    const client = await clerkClient();

    try {
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: role,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to update Clerk metadata:", error);
        return { success: false, error: "Failed to sync role" };
    }
}
