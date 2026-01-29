"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    AlertTriangle,
    MessageSquare,
    Gavel,
    XCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Search,
    Zap,
    ShieldAlert,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDisputesPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".dispute-card", {
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
            <header className="flex flex-col gap-2">
                <h1 className="text-5xl font-black tracking-tighter uppercase">DISPUTE CENTER</h1>
                <p className="text-white/40 font-medium">Mediate conflicts between vendors and consumers regarding product quality or BNPL terms.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard title="Open Disputes" value="24" type="active" icon={<AlertTriangle className="w-5 h-5" />} />
                <StatusCard title="Awaiting Response" value="8" type="warning" icon={<Clock className="w-5 h-5" />} />
                <StatusCard title="Resolved (30d)" value="142" type="success" icon={<CheckCircle2 className="w-5 h-5" />} />
                <StatusCard title="Avg. Resolution" value="1.2d" icon={<Zap className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Critical Disputes */}
                <div className="dispute-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[48px] p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black tracking-tight uppercase">URGENT MEDIATION</h3>
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest">High Priority</span>
                    </div>

                    <div className="space-y-4">
                        <DisputeItem
                            name="Defective Item: iPhone 15"
                            vendor="Solar Kiosk Tech"
                            user="John Doe"
                            status="Evidence Uploaded"
                        />
                        <DisputeItem
                            name="BNPL Refund Refusal"
                            vendor="Green Grocery Hub"
                            user="Sarah Smith"
                            status="Awaiting Vendor"
                        />
                        <DisputeItem
                            name="Incorrect Quality Score"
                            vendor="Nexus Logistics Hub"
                            user="Mark Wilson"
                            status="New Case"
                            isNew
                        />
                    </div>
                </div>

                {/* Mediation Rules */}
                <div className="dispute-card bg-primary text-black rounded-[48px] p-10 flex flex-col justify-between group">
                    <div>
                        <ShieldAlert className="w-10 h-10 mb-6" />
                        <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">ARBITRATION RULES</h3>
                        <p className="text-sm font-bold opacity-60 leading-tight">Nexus mediated settlements are final. Always prioritize data from <span className="font-black italic underline">Verified Quality Sensors</span>.</p>
                    </div>

                    <div className="mt-8 space-y-4 pt-8 border-t border-black/10">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4" />
                            <p className="text-xs font-black uppercase tracking-tight">Proof of Origin Required</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4" />
                            <p className="text-xs font-black uppercase tracking-tight">Direct Refund Capability</p>
                        </div>
                        <button className="w-full mt-4 py-4 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-2">
                            UPDATE POLICY <Gavel className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ title, value, type, icon }: any) {
    return (
        <div className="dispute-card bg-white/[0.03] border border-white/10 p-8 rounded-[32px] group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                    {icon}
                </div>
                {type && (
                    <div className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        type === "active" ? "text-primary" : type === "warning" ? "text-orange-500" : "text-green-500"
                    )}>
                        {type}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function DisputeItem({ name, vendor, user, status, isNew }: any) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all group/item">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center relative">
                    <MessageSquare className="w-5 h-5 text-white/20" />
                    {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full ring-4 ring-[#0a0a0a]" />}
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-tight">{name}</h4>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{user} vs {vendor}</p>
                </div>
            </div>
            <div className="flex items-center gap-8 mt-4 md:mt-0 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/5 px-3 py-1 rounded-lg">{status}</span>
                <button className="flex items-center gap-2 p-3 bg-white text-black rounded-xl hover:scale-95 transition-all opacity-0 group-hover/item:opacity-100">
                    <span className="text-[10px] font-black uppercase tracking-widest">Open Case</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
