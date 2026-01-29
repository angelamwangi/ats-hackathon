"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Palette, Upload, Store, CheckCircle2, ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { syncVendorRole } from "@/app/actions/auth";

export default function VendorOnboarding() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const updateBranding = useMutation(api.vendors.updateVendorBranding);
    const debugInfo = useQuery(api.debug.getUserDebugInfo, user ? { clerkId: user.id } : "skip");
    const cleanup = useMutation(api.debug.cleanupDuplicateUsers);

    const [shopName, setShopName] = useState("");
    const [keywords, setKeywords] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#22c55e"); // Default Emerald
    const [secondaryColor, setSecondaryColor] = useState("#000000");
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    const generateDescription = useAction(api.branding.generateBrandDescription);

    useEffect(() => {
        if (vendor) {
            // Guard: If already onboarded, force redirect to Dashboard
            if (vendor.onboardingStatus === "completed") {
                const checkRoleAndRedirect = async () => {
                    if (user?.publicMetadata?.role !== "vendor") {
                        await syncVendorRole(user!.id);
                        await user?.reload();
                    }
                    router.replace("/vendor/dashboard");
                };
                checkRoleAndRedirect();
                return;
            }

            setShopName(vendor.shopName);
            setDescription(vendor.description || "");
            setLogoUrl(vendor.logoUrl || "");
            if (vendor.brandConfig) {
                setPrimaryColor(vendor.brandConfig.primaryColor);
                setSecondaryColor(vendor.brandConfig.secondaryColor);
            }
        }
    }, [vendor, router]);

    const handleSave = async () => {
        if (!vendor) return;
        setSaving(true);
        try {
            await updateBranding({
                vendorId: vendor._id,
                description,
                logoUrl,
                brandConfig: {
                    primaryColor,
                    secondaryColor,
                }
            });

            // Ensure role matches
            if (user?.publicMetadata?.role !== "vendor") {
                await syncVendorRole(user!.id);
            }

            // Force reload session to update role claims for Middleware
            await user?.reload();
            router.push("/vendor/dashboard");
        } catch (error) {
            console.error("Failed to update branding:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Debug Logic

    if (!vendor && !debugInfo) {
        return (
            <div className="h-screen flex items-center justify-center bg-black flex-col gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-xs uppercase tracking-widest">Syncing Identity...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                        <Store className="w-3 h-3" /> Merchant Identity Setup
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
                        Define Your <span className="text-primary">Empire</span>
                    </h1>
                    <p className="text-white max-w-xl text-lg">
                        Customize how your retail ecosystem looks and feels. Your brand colors will theme your POS and customer receipts.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form Section */}
                    <div className="space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60">Shop Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block">Shop Name</label>
                                    <input
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 transition-all font-bold tracking-tight"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block">Brand Description</label>

                                    {/* AI Generator Input */}
                                    <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                                            <Sparkles className="w-3 h-3" /> AI Copywriter
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={keywords}
                                                onChange={(e) => setKeywords(e.target.value)}
                                                placeholder="What do you sell? (e.g. Organic coffee, Handmade shoes)"
                                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!shopName || !keywords) return;
                                                    setGenerating(true);
                                                    try {
                                                        const desc = await generateDescription({ shopName, keywords });
                                                        setDescription(desc);
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        setGenerating(false);
                                                    }
                                                }}
                                                disabled={generating || !keywords}
                                                className="bg-white! text-black p-2 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {generating ? (
                                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Wand2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Quality goods for the modern era..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 transition-all min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60">Branding</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block">Primary Color</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                                        />
                                        <span className="text-xs font-mono uppercase transition-all">{primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block">Accent Color</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
                                        <input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer"
                                        />
                                        <span className="text-xs font-mono uppercase">{secondaryColor}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white mb-2 block">Logo URL (Optional)</label>
                                <div className="relative">
                                    <input
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        placeholder="https://your-brand.com/logo.png"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-14 outline-none focus:border-primary/50 transition-all"
                                    />
                                    <Upload className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full cursor-pointer py-6 bg-white! text-black font-black uppercase tracking-widest rounded-[24px] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Launch Shop <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:sticky lg:top-12 h-fit space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary/60">Live Preview</h3>
                        <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 space-y-8 relative overflow-hidden group">
                            {/* Theme Indicator */}
                            <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-all duration-700" style={{ backgroundColor: primaryColor }} />

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-black overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Store className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter">{shopName}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Active System</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                                <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-white/5 bg-black/40" style={{ borderColor: `${primaryColor}20` }}>
                                    <div className="text-[8px] font-black uppercase text-white mb-1">POS Status</div>
                                    <div className="text-sm font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} /> Ready
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-white/5 bg-black/40" style={{ borderColor: `${primaryColor}20` }}>
                                    <div className="text-[8px] font-black uppercase text-white mb-1">Theme</div>
                                    <div className="text-sm font-bold uppercase tracking-widest">Custom</div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    style={{ backgroundColor: primaryColor, color: secondaryColor }}
                                >
                                    Sample Action
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex gap-4">
                            <Palette className="w-6 h-6 text-primary shrink-0" />
                            <p className="text-xs text-white leading-relaxed">
                                Tip: Use a primary color that has high contrast against dark backgrounds for the best POS experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

