"use client";

import { Settings, Image as ImageIcon, Palette, Layout, Save, Trash2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function VendorSettingsPage() {
    const containerRef = useRef(null);
    const [accentColor, setAccentColor] = useState("#ffffff");

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".settings-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, []);

    return (
        <div ref={containerRef} className="space-y-12 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase">SHOP CUSTOMIZER</h1>
                    <p className="text-white font-medium">Configure your store&apos;s digital presence and branding.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-black rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                    <Save className="w-5 h-5" /> PUBLISH CHANGES
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Visual Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="settings-card bg-white/[0.03] border border-white/10 rounded-[48px] p-10 space-y-10">
                        <section>
                            <h3 className="text-xl font-black tracking-tight uppercase mb-6 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> Hero & Banners
                            </h3>
                            <div className="aspect-[3/1] bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center group cursor-pointer hover:bg-white/[0.07] transition-all">
                                <Plus className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-all mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest opacity-20 group-hover:opacity-100">Upload Shop Banner</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-black tracking-tight uppercase mb-6 flex items-center gap-2">
                                <Palette className="w-5 h-5" /> Brand Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block tracking-widest">Shop Accent Color</label>
                                    <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/10 rounded-2xl">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                                        />
                                        <span className="font-black tracking-widest text-sm uppercase">{accentColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white mb-2 block tracking-widest">Storefront Typography</label>
                                    <select className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold focus:outline-none">
                                        <option>Geist Ultra Black</option>
                                        <option>Inter Enterprise</option>
                                        <option>Space Mono Bold</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Social & Contact */}
                    <div className="settings-card bg-white/[0.03] border border-white/10 rounded-[48px] p-10 space-y-6">
                        <h3 className="text-xl font-black tracking-tight uppercase">Public Contact Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Customer Support Email" placeholder="hello@yourshop.com" />
                            <InputGroup label="WhatsApp Business Number" placeholder="+263 77 123 4567" />
                        </div>
                    </div>
                </div>

                {/* Live Preview Sidebar */}
                <aside className="settings-card h-fit sticky top-12">
                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest mb-4 flex items-center gap-2">
                        <Layout className="w-4 h-4" /> Live Storefront Preview
                    </h4>
                    <div className="bg-[#050505] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="h-24 bg-white/5 border-b border-white/5 relative">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{ backgroundColor: accentColor }}
                            />
                        </div>
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 mb-4" />
                            <div className="h-6 w-32 bg-white/10 rounded-lg mb-2" />
                            <div className="h-4 w-48 bg-white/5 rounded-lg mb-8" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-white/5 rounded-2xl" />
                                <div className="aspect-square bg-white/5 rounded-2xl" />
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center">
                            <p className="text-[8px] font-black uppercase text-white tracking-tighter">Powered by Retail Nexus OS</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}

function InputGroup({ label, placeholder }: any) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase text-white mb-2 block tracking-widest">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary transition-all"
            />
        </div>
    )
}

