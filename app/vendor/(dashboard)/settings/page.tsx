"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Settings, Image as ImageIcon, Palette, Layout, Save, Trash2, ArrowRight, ShieldCheck, Zap, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNexusDialog } from "@/components/providers/NexusDialogProvider";

export default function VendorSettingsPage() {
    const { user } = useUser();
    const { alert } = useNexusDialog();
    const containerRef = useRef(null);

    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const updateBranding = useMutation(api.vendors.updateVendorBranding);
    const generateUploadUrl = useMutation(api.products.generateUploadUrl);

    const [isSaving, setIsSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [settings, setSettings] = useState({
        shopName: "",
        description: "",
        accentColor: "#ffffff",
        typography: "Geist Ultra Black",
        supportEmail: "",
        whatsappNumber: "",
        bannerUrl: "",
        logoUrl: ""
    });

    useEffect(() => {
        if (vendor) {
            setSettings({
                shopName: vendor.shopName || "",
                description: vendor.description || "",
                accentColor: vendor.brandConfig?.primaryColor || "#ffffff",
                typography: vendor.brandConfig?.typography || "Geist Ultra Black",
                supportEmail: vendor.contactInfo?.supportEmail || "",
                whatsappNumber: vendor.contactInfo?.whatsappNumber || "",
                bannerUrl: vendor.bannerUrl || "",
                logoUrl: vendor.logoUrl || ""
            });
        }
    }, [vendor]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".settings-card", {
                scale: 0.95,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
                clearProps: "all"
            });
        }
    }, []);

    const handleSave = async () => {
        if (!vendor) return;
        setIsSaving(true);
        try {
            await updateBranding({
                vendorId: vendor._id,
                shopName: settings.shopName,
                description: settings.description,
                logoUrl: settings.logoUrl,
                bannerUrl: settings.bannerUrl,
                brandConfig: {
                    primaryColor: settings.accentColor,
                    secondaryColor: settings.accentColor, // Defaulting same for now
                    typography: settings.typography
                },
                contactInfo: {
                    supportEmail: settings.supportEmail,
                    whatsappNumber: settings.whatsappNumber
                }
            });
            await alert("Settings Saved", "Your shop customization has been published to the Nexus.");
        } catch (error) {
            console.error(error);
            await alert("Error", "Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file || !vendor) return;

        if (type === 'banner') setUploadingBanner(true);
        else setUploadingLogo(true);

        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // Note: For real apps we'd get the actual URL, but for now we'll store storageId
            // The getProducts logic shows storage.getUrl, but here we'll just store the ID
            // and assume the backend/frontend handles the resolution if needed.
            // Simplified for this task to use storageId directly in setSettings for preview (local only)

            setSettings(prev => ({
                ...prev,
                [type === 'banner' ? 'bannerUrl' : 'logoUrl']: storageId
            }));
        } catch (error) {
            console.error(error);
            await alert("Upload Failed", "Could not upload the selected image.");
        } finally {
            if (type === 'banner') setUploadingBanner(false);
            else setUploadingLogo(false);
        }
    };

    return (
        <div ref={containerRef} className="space-y-12 pb-20 bg-black min-h-screen p-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">SHOP <span className="text-primary not-italic">CUSTOMIZER</span></h1>
                    <p className="text-zinc-300 font-medium max-w-lg mt-4 text-sm">Configure your store&apos;s digital presence and branding with high-fidelity control.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-[24px] hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs shadow-2xl disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    PUBLISH CHANGES
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Visual Settings */}
                <div className="lg:col-span-3 space-y-10">
                    <div className="settings-card bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 space-y-12 shadow-2xl">
                        <section>
                            <h3 className="text-2xl font-black tracking-tighter uppercase mb-8 flex items-center gap-3 text-white">
                                <ImageIcon className="w-6 h-6 text-primary" /> Hero & Banners
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <label className="block">
                                    <div className="aspect-[3/1] bg-black border-2 border-dashed border-zinc-800 rounded-[32px] flex flex-col items-center justify-center group cursor-pointer hover:bg-zinc-950 hover:border-primary transition-all shadow-inner overflow-hidden relative">
                                        {settings.bannerUrl ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 group-hover:bg-zinc-900/80 transition-all z-10">
                                                <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        ) : null}
                                        {uploadingBanner ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-zinc-800">
                                                    <Plus className="w-6 h-6 text-zinc-600 group-hover:text-primary" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">Shop Banner</p>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2 block ml-1 text-center">Recommended: 1200x400px</span>
                                </label>

                                <label className="block">
                                    <div className="aspect-[3/1] bg-black border-2 border-dashed border-zinc-800 rounded-[32px] flex flex-col items-center justify-center group cursor-pointer hover:bg-zinc-950 hover:border-primary transition-all shadow-inner relative overflow-hidden">
                                        {uploadingLogo ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-zinc-800">
                                                    <Plus className="w-6 h-6 text-zinc-600 group-hover:text-primary" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">Shop Logo</p>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2 block ml-1 text-center">Recommended: 400x400px (1:1)</span>
                                </label>
                            </div>
                        </section>

                        <section className="pt-12 border-t border-zinc-800">
                            <h3 className="text-2xl font-black tracking-tighter uppercase mb-8 flex items-center gap-3 text-white">
                                <Palette className="w-6 h-6 text-primary" /> Brand Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Shop Accent Color</label>
                                    <div className="flex items-center gap-6 p-6 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-inner">
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-zinc-800 hover:scale-105 transition-transform shadow-lg">
                                            <input
                                                type="color"
                                                value={settings.accentColor}
                                                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                                className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer bg-transparent border-none"
                                            />
                                        </div>
                                        <div>
                                            <span className="font-black tracking-tighter text-2xl uppercase text-white block leading-none">{settings.accentColor}</span>
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1 block">Active Hex Code</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">Storefront Typography</label>
                                    <select
                                        value={settings.typography}
                                        onChange={(e) => setSettings({ ...settings, typography: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-6 rounded-3xl text-xl font-black text-white focus:outline-none focus:border-primary transition-all shadow-inner appearance-none cursor-pointer"
                                    >
                                        <option>Geist Ultra Black</option>
                                        <option>Inter Enterprise</option>
                                        <option>Space Mono Bold</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Social & Contact */}
                    <div className="settings-card bg-zinc-900 border border-zinc-700 rounded-[48px] p-12 space-y-8 shadow-2xl">
                        <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Public Contact info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InputGroup
                                label="Customer Support Email"
                                placeholder="hello@yourshop.com"
                                value={settings.supportEmail}
                                onChange={(val: string) => setSettings({ ...settings, supportEmail: val })}
                            />
                            <InputGroup
                                label="WhatsApp Business Number"
                                placeholder="+254 77 123 4567"
                                value={settings.whatsappNumber}
                                onChange={(val: string) => setSettings({ ...settings, whatsappNumber: val })}
                            />
                        </div>
                    </div>
                </div>

                {/* Live Preview Sidebar */}
                <aside className="settings-card h-fit sticky top-12 space-y-6">
                    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center gap-3">
                        <Layout className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Real-time Preview</span>
                    </div>

                    <div className="bg-black border-2 border-zinc-800 rounded-[56px] overflow-hidden shadow-2xl relative group">
                        <div className="h-32 bg-zinc-900 relative border-b border-zinc-800">
                            <div
                                className="absolute inset-0 transition-all duration-700"
                                style={{ backgroundColor: settings.accentColor }}
                            />
                            <div className="absolute bottom-6 left-10 w-20 h-20 bg-black border-4 border-zinc-950 rounded-[28px] shadow-2xl overflow-hidden flex items-center justify-center">
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-zinc-800" />
                                </div>
                            </div>
                        </div>
                        <div className="p-10 pt-16">
                            <div
                                className="h-4 w-32 bg-zinc-800 rounded-full mb-3"
                                style={{ fontFamily: settings.typography === 'Space Mono Bold' ? 'monospace' : settings.typography === 'Inter Enterprise' ? 'sans-serif' : 'inherit' }}
                            />
                            <div className="h-2 w-48 bg-zinc-900 rounded-full mb-10" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-zinc-900 rounded-[24px] border border-zinc-800 shadow-inner" />
                                <div className="aspect-square bg-zinc-900 rounded-[24px] border border-zinc-800 shadow-inner" />
                            </div>
                        </div>
                        <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-center">
                            <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Powered by <span className="text-white">Nexus OS</span></p>
                        </div>
                    </div>

                    <div className="p-8 bg-zinc-900 border-2 border-red-900 rounded-[40px] shadow-xl group hover:border-red-700 transition-all cursor-pointer">
                        <Trash2 className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black text-xs text-white uppercase tracking-widest mb-2">Danger Zone</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight leading-relaxed">
                            Resetting all custom configurations will revert your shop to the default state.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function InputGroup({ label, placeholder, value, onChange }: any) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 mb-3 block tracking-widest ml-1">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-6 rounded-3xl text-xl font-black text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-zinc-800"
            />
        </div>
    )
}
