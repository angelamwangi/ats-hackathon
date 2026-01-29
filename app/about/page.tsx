"use client";

import { Info, Target, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white py-32 px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">ABOUT<br /><span className="text-primary italic">RETAIL NEXUS</span></h1>
                <p className="text-xl text-white/60 leading-relaxed mb-16">
                    Retail Nexus is the operating system for the next generation of commerce. We bridge the gap between physical retail and global digital marketplaces, providing small vendors with enterprise-grade tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10">
                        <Target className="w-10 h-10 text-primary mb-6" />
                        <h3 className="text-2xl font-black uppercase mb-4">OUR MISSION</h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                            To empower informal traders and small shop owners with decentralized, offline-first technology that levels the playing field.
                        </p>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10">
                        <ShieldCheck className="w-10 h-10 text-primary mb-6" />
                        <h3 className="text-2xl font-black uppercase mb-4">THE ECOSYSTEM</h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                            A unified platform where "Save-to-Buy" credit and circular economy principles drive sustainable growth for everyone.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
