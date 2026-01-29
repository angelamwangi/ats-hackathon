"use client";

import { Wallet, CreditCard, History, ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function WalletPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".wallet-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
            <header className="mb-12">
                <h2 className="text-5xl font-black tracking-tight mb-4 uppercase">DIGITAL WALLET</h2>
                <p className="text-white max-w-xl text-lg font-medium leading-relaxed">
                    Manage your <span className="text-primary italic">Nexus Points</span>, direct balance, and escrow refunds.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Main Balance */}
                <div className="wallet-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-1000" />

                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-12">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-black" />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 text-primary" /> Verified via Clerk
                            </div>
                        </div>

                        <div className="mb-12">
                            <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">Total Available Balance</p>
                            <p className="text-7xl font-black tracking-tighter">$2,420.50</p>
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 active:scale-95 transition-all">
                                TOP UP WALLET
                            </button>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 active:scale-95 transition-all">
                                WITHDRAW
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loyalty Points */}
                <div className="wallet-card bg-primary text-black rounded-[48px] p-10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16" />

                    <div>
                        <Zap className="w-10 h-10 mb-6 fill-black" />
                        <h3 className="text-4xl font-black tracking-tighter leading-none mb-2">12,500<br />POINTS</h3>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Nexus Loyalty Score</p>
                    </div>

                    <div className="pt-8 border-t border-black/10">
                        <p className="text-sm font-bold leading-tight mb-4 tracking-tight">You are in the <span className="font-black italic">Platinum Tier</span>. Enjoy 2% cashback on all direct purchases.</p>
                        <button className="w-full py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                            REDEEM REWARDS
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <section className="wallet-card">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight uppercase">RECENT ACTIVITY</h3>
                    <button className="text-xs font-bold text-white hover:text-white transition-colors uppercase tracking-widest">View PDF Statement</button>
                </div>

                <div className="space-y-4">
                    <TransactionRow
                        name="Escrow Refund: iPhone 15"
                        date="Today, 2:45 PM"
                        amount="+$949.05"
                        isPositive={true}
                        type="Refund"
                    />
                    <TransactionRow
                        name="Purchase: Sony WH-1000XM5"
                        date="Jan 24, 2026"
                        amount="-$399.00"
                        isPositive={false}
                        type="Purchase"
                    />
                    <TransactionRow
                        name="Deposit: Marketplace Wallet"
                        date="Jan 22, 2026"
                        amount="+$500.00"
                        isPositive={true}
                        type="Top Up"
                    />
                </div>
            </section>
        </div>
    );
}

function TransactionRow({ name, date, amount, isPositive, type }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                    {isPositive ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                    <p className="font-bold text-lg">{name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-white border border-white/10 px-2 py-0.5 rounded-md">{type}</span>
                        <span className="text-[10px] font-black uppercase text-white">{date}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className={cn("text-xl font-black tracking-tight", isPositive ? "text-green-500" : "text-white")}>
                    {amount}
                </p>
                <div className="flex items-center gap-1.5 justify-end mt-1 text-white">
                    <p className="text-[10px] font-black uppercase">Success</p>
                    <CheckCircle2 className="w-3 h-3 text-green-500/40" />
                </div>
            </div>
        </div>
    );
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    )
}

