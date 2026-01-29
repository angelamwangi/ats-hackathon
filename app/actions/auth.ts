"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function syncVendorRole(userId: string) {
    try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "vendor",
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to sync vendor role:", error);
        return { success: false, error };
    }
}
