"use client";

import { useEffect, useRef, useState } from "react";
import { SignIn, useUser, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, User, ArrowRight, Zap, ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Link from "next/link";

type RoleType = "customer" | "vendor" | null;

const roleOptions = [
    {
        id: "customer" as const,
        title: "I'm a Consumer",
        subtitle: "Shop the Marketplace",
        desc: "Browse products, compare quality scores, use Save-to-Buy credit, and track your orders.",
        icon: <User className="w-10 h-10" />,
        color: "#3b82f6",
        redirectTo: "/consumer/marketplace",
    },
    {
        id: "vendor" as const,
        title: "I'm a Vendor",
        subtitle: "Manage My Business",
        desc: "Access your POS, manage inventory, view analytics, and maximize your sales.",
        icon: <Store className="w-10 h-10" />,
        color: "#22c55e",
        redirectTo: "/vendor/onboarding",
    },
];

export default function SignInPage() {
    const { isSignedIn, isLoaded } = useUser();
    const { userId } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<RoleType>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRedirected = useRef(false);

    // Check if role was pre-selected via URL params or localStorage
    useEffect(() => {
        const roleParam = searchParams.get("role") as RoleType;
        if (roleParam && (roleParam === "customer" || roleParam === "vendor")) {
            setSelectedRole(roleParam);
            localStorage.setItem("preferredRole", roleParam);
        } else {
            // Check localStorage for previously selected role
            const storedRole = localStorage.getItem("preferredRole") as RoleType;
            if (storedRole && (storedRole === "customer" || storedRole === "vendor")) {
                setSelectedRole(storedRole);
            }
        }
    }, [searchParams]);

    // Animate on mount
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".role-option",
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    stagger: 0.15,
                    duration: 0.8,
                    ease: "power3.out",
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [selectedRole]);

    // Handle post-login redirect - this is the critical fix
    useEffect(() => {
        if (isLoaded && isSignedIn && userId && !hasRedirected.current) {
            const storedRole = localStorage.getItem("preferredRole") as RoleType;
            const roleToUse = selectedRole || storedRole;

            if (roleToUse) {
                const roleConfig = roleOptions.find(r => r.id === roleToUse);
                if (roleConfig) {
                    hasRedirected.current = true;
                    console.log("Redirecting to:", roleConfig.redirectTo);
                    router.replace(roleConfig.redirectTo);
                }
            } else {
                // No role selected, default to consumer marketplace
                hasRedirected.current = true;
                router.replace("/consumer/marketplace");
            }
        }
    }, [isLoaded, isSignedIn, userId, selectedRole, router]);

    const handleRoleSelect = (role: RoleType) => {
        setSelectedRole(role);
        if (role) {
            localStorage.setItem("preferredRole", role);
        }
    };

    const handleBack = () => {
        setSelectedRole(null);
        localStorage.removeItem("preferredRole");
    };

    // If already signed in, show loading while redirecting
    if (isLoaded && isSignedIn) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    // Get the redirect URL for the SignIn component
    const getRedirectUrl = () => {
        const role = selectedRole || localStorage.getItem("preferredRole") as RoleType;
        if (role) {
            const roleConfig = roleOptions.find(r => r.id === role);
            return roleConfig?.redirectTo || "/consumer/marketplace";
        }
        return "/consumer/marketplace";
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8 relative overflow-hidden"
        >
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[180px] rounded-full" />
            </div>

            <div className="w-full max-w-5xl">
                {/* Header */}
                <header className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                            <div className="w-6 h-6 bg-black rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">
                            RETAIL <span className="text-white/40 italic">NEXUS</span>
                        </span>
                    </Link>
                </header>

                {/* Step 1: Role Selection */}
                {!selectedRole && (
                    <div className="space-y-12">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
                                <Zap className="w-3 h-3 fill-primary" /> Get Started
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-4">
                                HOW WILL YOU <span className="text-white/20 italic">USE</span> NEXUS?
                            </h1>
                            <p className="text-white/40 text-lg font-medium max-w-xl mx-auto">
                                Select your primary role to get started with a personalized experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {roleOptions.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={cn(
                                        "role-option group relative p-10 rounded-[40px] text-left transition-all duration-500 border-2 overflow-hidden",
                                        "bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06]"
                                    )}
                                >
                                    {/* Glow Effect */}
                                    <div
                                        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                                        style={{ backgroundColor: role.color }}
                                    />

                                    <div
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110"
                                        style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                    >
                                        {role.icon}
                                    </div>

                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{role.title}</h3>
                                    <p className="text-sm font-bold mb-4" style={{ color: role.color }}>{role.subtitle}</p>
                                    <p className="text-sm text-white/40 leading-relaxed">{role.desc}</p>

                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                                        Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Admin Hint */}
                        <div className="text-center">
                            <p className="text-xs text-white/20">
                                Are you an administrator?{" "}
                                <Link href="/admin/dashboard" className="text-white/40 hover:text-white underline underline-offset-4 transition-colors">
                                    Access Admin Portal
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Clerk Sign-In */}
                {selectedRole && (
                    <div className="space-y-8">
                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-bold transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Change Role
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Role Confirmation */}
                            <div className="space-y-8">
                                {(() => {
                                    const role = roleOptions.find(r => r.id === selectedRole);
                                    if (!role) return null;
                                    return (
                                        <>
                                            <div
                                                className="w-24 h-24 rounded-[32px] flex items-center justify-center"
                                                style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                            >
                                                {role.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-4">
                                                    {role.title === "I'm a Consumer" ? "WELCOME," : "WELCOME BACK,"}
                                                    <br />
                                                    <span style={{ color: role.color }}>{role.title === "I'm a Consumer" ? "SHOPPER" : "MERCHANT"}</span>
                                                </h2>
                                                <p className="text-white/40 text-lg font-medium leading-relaxed">
                                                    Sign in or create an account to {role.title === "I'm a Consumer" ? "start shopping and saving" : "manage your business"}.
                                                </p>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                                    <span className="text-white/60">Secure authentication via Clerk</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Zap className="w-5 h-5 text-primary" />
                                                    <span className="text-white/60">Instant access to your dashboard</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Clerk Sign-In Component */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                                    <div id="clerk-captcha"></div>
                                    <SignIn
                                        appearance={{
                                            elements: {
                                                rootBox: "mx-auto",
                                                card: "bg-transparent shadow-none border-0",
                                                headerTitle: "text-white font-black text-2xl",
                                                headerSubtitle: "text-white/40",
                                                socialButtonsBlockButton: "bg-white/10 border-white/10 text-white hover:bg-white/20",
                                                socialButtonsBlockButtonText: "font-bold",
                                                dividerLine: "bg-white/10",
                                                dividerText: "text-white/20",
                                                formFieldLabel: "text-white/60 font-bold",
                                                formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl focus:border-primary",
                                                formButtonPrimary: "bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-widest rounded-xl",
                                                footerActionLink: "text-primary hover:text-primary/80",
                                                identityPreviewText: "text-white",
                                                identityPreviewEditButton: "text-primary",
                                            },
                                        }}
                                        forceRedirectUrl={getRedirectUrl()}
                                        signUpForceRedirectUrl={getRedirectUrl()}
                                        signUpUrl="/sign-in"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
