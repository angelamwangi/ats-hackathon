"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    Users,
    ShieldCheck,
    FileText,
    Clock,
    XCircle,
    CheckCircle2,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminVendorsPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".admin-card", {
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
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase">VENDOR GOVERNANCE</h1>
                    <p className="text-white/40 font-medium">Approve new merchants and monitor KYC compliance.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-all" />
                        <input
                            type="text"
                            placeholder="Search by Vendor ID..."
                            className="pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/20 w-80 transition-all font-medium"
                        />
                    </div>
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <GovernanceStat title="Pending Approvals" value="14" type="warning" />
                <GovernanceStat title="Verified Merchants" value="1,204" type="success" />
                <GovernanceStat title="Suspended" value="3" type="error" />
            </div>

            <section className="admin-card bg-white/[0.03] border border-white/10 rounded-[48px] overflow-hidden">
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-xl font-black tracking-tight uppercase">KYC QUEUE</h3>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Live Assessment Layer Active</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <th className="px-8 py-6">Merchant Entity</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Docs Status</th>
                                <th className="px-8 py-6">Received</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <KYCRow
                                name="Solar Kiosk Tech"
                                sub="Harare, ZW • Reg #4412"
                                cat="Electronics"
                                status="pending"
                                date="2h ago"
                            />
                            <KYCRow
                                name="Green Grocery Hub"
                                sub="Bulawayo, ZW • Reg #9901"
                                cat="FMCG"
                                status="reviewing"
                                date="5h ago"
                            />
                            <KYCRow
                                name="QuickPay Retail"
                                sub="Mutare, ZW • Reg #2210"
                                cat="Services"
                                status="suspended"
                                date="1d ago"
                            />
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function GovernanceStat({ title, value, type }: any) {
    return (
        <div className="admin-card p-8 bg-white/[0.03] border border-white/10 rounded-[32px] group hover:border-white/20 transition-all">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-black tracking-tighter">{value}</p>
                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    type === "warning" ? "bg-orange-500/10 text-orange-500" :
                        type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                    {type === "warning" ? <Clock className="w-4 h-4" /> :
                        type === "success" ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
            </div>
        </div>
    );
}

function KYCRow({ name, sub, cat, status, date }: any) {
    return (
        <tr className="group hover:bg-white/[0.02] transition-all">
            <td className="px-8 py-6">
                <div>
                    <p className="font-bold text-sm tracking-tight">{name}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase whitespace-nowrap">{sub}</p>
                </div>
            </td>
            <td className="px-8 py-6">
                <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest">{cat}</span>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        status === "pending" ? "bg-orange-500" :
                            status === "reviewing" ? "bg-primary animate-pulse" : "bg-red-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{status}</span>
                </div>
            </td>
            <td className="px-8 py-6">
                <p className="text-[10px] font-bold text-white/40 uppercase">{date}</p>
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        REVIEW DOCS
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4 text-white/20" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
