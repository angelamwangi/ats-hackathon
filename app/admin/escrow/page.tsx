"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    Wallet,
    TrendingUp,
    ArrowDownLeft,
    Percent,
    ShieldCheck,
    BarChart3,
    History,
    Lock,
    ArrowRight,
    Zap,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminEscrowPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".escrow-card", {
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
                <h1 className="text-5xl font-black tracking-tighter uppercase">ESCROW GOVERNANCE</h1>
                <p className="text-white font-medium">Monitoring BNPL progress jars and platform liquidity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total In Jars" value="$1.2M" sub="Escrow held in BNPL" icon={<Lock className="w-5 h-5" />} isPrimary />
                <MetricCard title="Cancelation Fees" value="$64k" sub="5% platform revenue" icon={<Percent className="w-5 h-5" />} />
                <MetricCard title="Daily Deposits" value="$12.4k" sub="+8% from yesterday" icon={<TrendingUp className="w-5 h-5" />} />
                <MetricCard title="Fulfilled Volume" value="$840k" sub="Gross GMV this month" icon={<CheckCircle2 className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settlement Overview */}
                <section className="escrow-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xl font-black tracking-tight uppercase">SETTLEMENT QUEUE</h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <History className="w-3 h-3 text-primary" /> Auto-Syncing
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SettlementRow
                            vendor="Nexus Logistics Hub"
                            amount="$42,500.00"
                            items={124}
                            status="Pending Payout"
                        />
                        <SettlementRow
                            vendor="Solar Kiosk Tech"
                            amount="$8,210.40"
                            items={42}
                            status="Verifying"
                        />
                        <SettlementRow
                            vendor="Green Grocery Hub"
                            amount="$1,420.00"
                            items={12}
                            status="Processing"
                            isActive
                        />
                    </div>
                </section>

                {/* Risk Analysis */}
                <div className="escrow-card bg-white/[0.03] border border-white/10 rounded-[48px] p-10 flex flex-col justify-between group">
                    <div>
                        <BarChart3 className="w-10 h-10 mb-6 text-primary" />
                        <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">LIQUIDITY RISK</h3>
                        <p className="text-sm font-bold opacity-40 leading-tight">Escrow-to-Payout ratio is <span className="text-white font-black italic">1.4:1</span>. Nexus reserves are healthy.</p>
                    </div>

                    <div className="pt-8 space-y-4 border-t border-white/10">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Withdrawal Pressure</span>
                                <span className="text-green-500">LOW</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[20%]" />
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                            GENERATE REPORT <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon, isPrimary }: any) {
    return (
        <div className={cn(
            "escrow-card p-8 rounded-[32px] border transition-all flex flex-col justify-between group",
            isPrimary ? "bg-primary border-primary text-black" : "bg-white/[0.03] border-white/10"
        )}>
            <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                isPrimary ? "bg-black/10" : "bg-white/5 text-white group-hover:bg-white group-hover:text-black"
            )}>
                {icon}
            </div>
            <div className="mt-8">
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isPrimary ? "text-black/60" : "text-white")}>{title}</p>
                <p className="text-3xl font-black tracking-tighter">{value}</p>
                <p className={cn("text-[10px] font-bold mt-1", isPrimary ? "text-black/40" : "text-white")}>{sub}</p>
            </div>
        </div>
    )
}

function SettlementRow({ vendor, amount, items, status, isActive }: any) {
    return (
        <div className={cn(
            "flex items-center justify-between p-6 rounded-[24px] border transition-all group",
            isActive ? "bg-white/10 border-white/10" : "bg-white/5 border-transparent hover:border-white/5"
        )}>
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white">
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-lg">{vendor}</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Batch Settlement: {items} Claims</p>
                </div>
            </div>
            <div className="flex items-center gap-12 text-right">
                <div className="hidden md:block">
                    <p className="text-[10px] font-black text-white uppercase mb-1">Settlement Amount</p>
                    <p className="text-lg font-black">{amount}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-white"
                    )}>{status}</span>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

