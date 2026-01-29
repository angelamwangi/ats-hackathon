"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Completing sign in...</p>
            </div>
            {/* This handles the OAuth callback token exchange */}
            <AuthenticateWithRedirectCallback
                signInForceRedirectUrl="/auth-redirect"
                signUpForceRedirectUrl="/auth-redirect"
            />
        </div>
    );
}

