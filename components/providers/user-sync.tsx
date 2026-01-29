"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { RoleSelector } from "@/components/role-selector";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

const PUBLIC_ROUTES_PREFIXES = [
    "/consumer/marketplace",
    "/consumer/product",
    "/sign-in",
    "/sustainability",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/support"
];

export function UserSync() {
    const { user, isLoaded } = useUser();
    const storeUser = useMutation(api.users.storeUser);
    const [synced, setSynced] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (isLoaded && user && !synced) {
            const rawRole = user.publicMetadata.role as string | undefined;
            const validRoles = ["customer", "vendor", "admin"];

            // Normalize and validate role
            const role = rawRole && validRoles.includes(rawRole.trim().toLowerCase()) ? rawRole.trim().toLowerCase() : null;

            if (!role) {
                // If role is missing, we stick to "guest" mode or wait for auth-redirect to fix it.
                // We no longer show the blocking modal.
                return;
            }

            const sync = async () => {
                try {
                    await storeUser({
                        clerkId: user.id,
                        name: user.fullName || user.username || "Anonymous",
                        email: user.emailAddresses[0]?.emailAddress || "",
                        role: role as any,
                    });

                    // Identify in PostHog
                    posthog.identify(user.id, {
                        email: user.emailAddresses[0]?.emailAddress,
                        name: user.fullName || user.username,
                        role: role
                    });

                    setSynced(true);
                } catch (error: any) {
                    console.error("Failed to sync user data:", error);
                    // Silent fail or toast - but don't block
                }
            };
            sync();
        }
    }, [isLoaded, user, storeUser, synced, pathname]);

    return null;
}

