"use client";

import { useEffect, useRef, useState } from "react";
import { SignUp, useUser, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, User, ArrowRight, Zap, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Link from "next/link";

type RoleType = "customer" | "vendor" | "logistics" | null;

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
    {
        id: "logistics" as const,
        title: "I'm a Courier",
        subtitle: "Deliver the Nexus",
        desc: "Access your rider dashboard, manage deliveries, and track your earnings on the go.",
        icon: <Truck className="w-10 h-10" />,
        color: "#fbbf24",
        redirectTo: "/logistics",
    },
];

export default function SignUpPage() {
    const { isSignedIn, isLoaded } = useUser();
    const { userId } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<RoleType>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRedirected = useRef(false);

    useEffect(() => {
        const roleParam = searchParams.get("role") as RoleType;
        if (roleParam && (roleParam === "customer" || roleParam === "vendor" || roleParam === "logistics")) {
            setSelectedRole(roleParam);
            localStorage.setItem("preferredRole", roleParam);
        } else {
            const storedRole = localStorage.getItem("preferredRole") as RoleType;
            if (storedRole && (storedRole === "customer" || storedRole === "vendor" || storedRole === "logistics")) {
                setSelectedRole(storedRole);
            }
        }
    }, [searchParams]);

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

    useEffect(() => {
        if (isLoaded && isSignedIn && userId && !hasRedirected.current) {
            const storedRole = localStorage.getItem("preferredRole") as RoleType;
            const roleToUse = selectedRole || storedRole;

            if (roleToUse) {
                const roleConfig = roleOptions.find(r => r.id === roleToUse);
                if (roleConfig) {
                    hasRedirected.current = true;
                    router.replace(roleConfig.redirectTo);
                }
            } else {
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

    if (isLoaded && isSignedIn) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-white font-bold uppercase tracking-widest text-xs">Finalizing your account...</p>
                </div>
            </div>
        );
    }

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
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[180px] rounded-full" />
            </div>

            <div className="w-full max-w-5xl">
                <header className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                            <div className="w-6 h-6 bg-black rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">
                            RETAIL <span className="text-white italic">NEXUS</span>
                        </span>
                    </Link>
                </header>

                {!selectedRole && (
                    <div className="space-y-12">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
                                <Zap className="w-3 h-3 fill-primary" /> Joint the Network
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-4">
                                CREATE YOUR <span className="text-white italic">NEXUS</span> ID
                            </h1>
                            <p className="text-white text-lg font-medium max-w-xl mx-auto">
                                Choose your primary objective to customize your toolset.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {roleOptions.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={cn(
                                        "role-option group relative p-8 rounded-[40px] text-left transition-all duration-500 border-2 overflow-hidden",
                                        "bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06]"
                                    )}
                                >
                                    <div
                                        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                                        style={{ backgroundColor: role.color }}
                                    />

                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                                        style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                    >
                                        {role.icon}
                                    </div>

                                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">{role.title}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60" style={{ color: role.color }}>{role.subtitle}</p>
                                    <p className="text-xs text-white/70 leading-relaxed">{role.desc}</p>

                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                        Select <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedRole && (
                    <div className="space-y-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white hover:text-white text-sm font-bold transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Selection
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                {(() => {
                                    const role = roleOptions.find(r => r.id === selectedRole);
                                    if (!role) return null;
                                    return (
                                        <>
                                            <div
                                                className="w-20 h-20 rounded-[24px] flex items-center justify-center"
                                                style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                            >
                                                {role.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-4">
                                                    REGISTER AS<br />
                                                    <span style={{ color: role.color }}>{role.id.toUpperCase()}</span>
                                                </h2>
                                                <p className="text-white text-lg font-medium leading-relaxed opacity-60 font-mono">
                                                    Creating your encrypted profile on the Nexus blockchain...
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="flex justify-center lg:justify-end">
                                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                                    <SignUp
                                        appearance={{
                                            elements: {
                                                rootBox: "mx-auto",
                                                card: "bg-transparent shadow-none border-0",
                                                headerTitle: "text-white font-black text-2xl",
                                                headerSubtitle: "text-white opacity-60",
                                                socialButtonsBlockButton: "bg-white/10 border-white/10 text-white hover:bg-white/20",
                                                socialButtonsBlockButtonText: "font-bold",
                                                dividerLine: "bg-white/10",
                                                dividerText: "text-white",
                                                formFieldLabel: "text-white font-bold",
                                                formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl focus:border-primary",
                                                formButtonPrimary: "bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-widest rounded-xl",
                                                footerActionLink: "text-primary hover:text-primary/80",
                                                identityPreviewText: "text-white",
                                                identityPreviewEditButton: "text-primary",
                                            },
                                        }}
                                        signInUrl="/sign-in"
                                        forceRedirectUrl={getRedirectUrl()}
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
