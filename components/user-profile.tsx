"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, SignOutButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export function UserProfile() {
    const { user, isLoaded } = useUser();
    const userData = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || ""
    });

    if (!isLoaded) return <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />;

    if (!user) {
        return (
            <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary transition-all active:scale-95 shadow-xl">
                    Sign In
                </button>
            </SignInButton>
        );
    }

    const role = user.publicMetadata.role as string | undefined;

    return (
        <div className="flex items-center gap-4 p-2 pl-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex flex-col items-end">
                <p className="font-bold text-white text-sm">{user.firstName || "Member"}</p>
                {!userData ? (
                    !role ? (
                        <Link href="/sign-in" className="text-[8px] text-primary hover:text-white uppercase tracking-widest font-black animate-pulse">
                            Complete Setup
                        </Link>
                    ) : (
                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-black animate-pulse">
                            SYNCING...
                        </p>
                    )
                ) : (
                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">
                        {userData.role}
                    </p>
                )}
            </div>
            <img
                src={user.imageUrl}
                alt={user.fullName || "User"}
                className="w-10 h-10 rounded-xl border border-white/10"
            />
            <SignOutButton>
                <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </button>
            </SignOutButton>
        </div>
    );
}
