"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { syncUserRole } from "@/lib/actions/user";

export default function AuthRedirectPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
            if (isLoaded && isSignedIn && user) {
                // Get the stored role preference
                const storedRole = localStorage.getItem("preferredRole");
                console.log("Auth redirect - User:", user.id, "Role:", storedRole);

                // Attempt to sync role immediately if we have a preference
                if (storedRole === "vendor" || storedRole === "customer") {
                    try {
                        await syncUserRole(user.id, storedRole as "vendor" | "customer");
                        // Force token refresh after backend update
                        await user.reload();
                    } catch (err) {
                        console.error("Auto-sync failed:", err);
                    }
                }

                if (storedRole === "vendor") {
                    router.replace("/vendor/onboarding");
                } else {
                    router.replace("/consumer/marketplace");
                }
            } else if (isLoaded && !isSignedIn) {
                router.replace("/sign-in");
            }
        };

        handleRedirect();
    }, [isLoaded, isSignedIn, user, router]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Setting up your dashboard...</p>
            </div>
        </div>
    );
}
