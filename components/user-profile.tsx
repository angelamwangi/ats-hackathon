"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, SignOutButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { LogOut } from "lucide-react";

export function UserProfile() {
    const { user, isLoaded } = useUser();
    const userData = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || ""
    });

    if (!isLoaded) return <div className="w-full h-14 rounded-2xl bg-zinc-800 animate-pulse" />;

    if (!user) {
        return (
            <SignInButton mode="modal">
                <button className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
                    Sign In
                </button>
            </SignInButton>
        );
    }

    const role = user.publicMetadata.role as string | undefined;

    return (
        <div className="flex items-center gap-4 p-3 bg-black rounded-[22px] border border-zinc-800">
            <div className="flex flex-col items-start flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate w-full uppercase tracking-tight">{user.firstName || "Member"}</p>
                {!userData ? (
                    !role ? (
                        <Link href="/sign-in" className="text-[10px] text-primary hover:text-white uppercase tracking-widest font-black animate-pulse">
                            Setup Required
                        </Link>
                    ) : (
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black animate-pulse">
                            Syncing...
                        </p>
                    )
                ) : (
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black leading-none mt-1">
                        {userData.role}
                    </p>
                )}
            </div>
            <div className="relative shrink-0">
                <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-10 h-10 rounded-xl border border-zinc-800 shadow-md grayscale-[0.2] hover:grayscale-0 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
            </div>
            <SignOutButton>
                <button className="p-3 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group">
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </SignOutButton>
        </div>
    );
}
