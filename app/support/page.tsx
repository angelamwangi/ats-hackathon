"use client";

import { HelpCircle, Book, MessageSquare, ShieldCheck, Zap, ArrowRight, Search, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function HelpPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".help-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12 pb-32">
            <header className="mb-20 text-center flex flex-col items-center">
                <h2 className="text-6xl font-black tracking-tighter mb-6 uppercase">HOW CAN WE<br />HELP YOU?</h2>
                <div className="relative group max-w-2xl w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white transition-all" />
                    <input
                        type="text"
                        placeholder="Search tutorials, BNPL rules, or system guides..."
                        className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-[32px] focus:outline-none focus:border-primary transition-all text-lg font-medium"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <CategoryCard
                    title="Consumables"
                    desc="Save-to-buy rules, 95% refund policy, and wallet management."
                    icon={<Zap className="w-6 h-6" />}
                />
                <CategoryCard
                    title="Merchants"
                    desc="POS offline mode, inventory sync, and settlement cycles."
                    icon={<Globe className="w-6 h-6" />}
                />
                <CategoryCard
                    title="Security"
                    desc="KYC verification, data privacy, and dispute resolution."
                    icon={<ShieldCheck className="w-6 h-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="help-card space-y-8">
                    <h3 className="text-2xl font-black tracking-tight uppercase">POPULAR ARTICLES</h3>
                    <div className="space-y-4">
                        <ArticleLink title="Understanding the 5% Cancelation Fee" time="4 min read" />
                        <ArticleLink title="How to Sync POS Data Post-Offline" time="2 min read" />
                        <ArticleLink title="Maximizing your Nexus Loyalty Points" time="6 min read" />
                        <ArticleLink title="Vendor Onboarding: Document Checklist" time="3 min read" />
                    </div>
                </section>

                <section className="help-card bg-primary text-black rounded-[48px] p-10 flex flex-col justify-between group">
                    <div>
                        <MessageSquare className="w-10 h-10 mb-6" />
                        <h3 className="text-3xl font-black tracking-tight mb-4 uppercase">LIVE SUPPORT</h3>
                        <p className="text-sm font-bold opacity-60 leading-relaxed mb-10">
                            Can&apos;t find what you need? Our global mediation team is available 24/7 to assist with disputes or technical issues.
                        </p>
                        <button className="flex items-center gap-2 group-hover:gap-4 transition-all text-sm font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-2xl">
                            START CHAT <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

function CategoryCard({ title, desc, icon }: any) {
    return (
        <div className="help-card bg-white/[0.03] border border-white/10 p-10 rounded-[40px] hover:border-white/20 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all mb-8">
                {icon}
            </div>
            <h4 className="text-xl font-black uppercase tracking-tight mb-2">{title}</h4>
            <p className="text-sm font-bold text-white/40 leading-relaxed">{desc}</p>
        </div>
    );
}

function ArticleLink({ title, time }: any) {
    return (
        <a href="#" className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-white/20" />
                <span className="font-bold text-sm tracking-tight">{title}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-white/20">{time}</span>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-all" />
            </div>
        </a>
    );
}
