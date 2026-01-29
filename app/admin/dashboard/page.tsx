"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    TrendingUp,
    Users,
    Store,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray(".stat-card");
            gsap.fromTo(cards,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power3.out"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="space-y-12">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest w-fit animate-pulse">
                    <ShieldCheck className="w-3 h-3" /> Platform Secured
                </div>
                <h1 className="text-5xl font-black tracking-tighter">PLATFORM PULSE</h1>
                <p className="text-white/40 font-medium">Real-time governance and global economic metrics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Global GMV"
                    value="$128.4k"
                    trend="+12.4%"
                    isPositive={true}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Active BNPL Escrow"
                    value="$42.9k"
                    trend="+8.1%"
                    isPositive={true}
                    icon={<CreditCard className="w-5 h-5" />}
                />
                <StatCard
                    title="Onboarded Vendors"
                    value="84"
                    trend="-2.4%"
                    isPositive={false}
                    icon={<Store className="w-5 h-5" />}
                />
                <StatCard
                    title="Customer Base"
                    value="2,104"
                    trend="+18.2%"
                    isPositive={true}
                    icon={<Users className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight">VENDOR HEALTH INDEX</h3>
                        <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">VIEW ALL VENDORS</button>
                    </div>

                    <div className="space-y-6">
                        <VendorRow name="Nexus Electronics" sales="$12.4k" health={98} status="Premium" />
                        <VendorRow name="Organic Harvest" sales="$8.2k" health={82} status="Stable" />
                        <VendorRow name="Style Maven" sales="$4.1k" health={45} status="Warning" />
                        <VendorRow name="Tech Haven" sales="$15.9k" health={95} status="Premium" />
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                    <h3 className="text-xl font-black tracking-tight mb-4">AI PRICE INTEL</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-8">
                        Market median prices for <span className="text-white font-bold">Category: Electronics</span> have risen by 4.2% in your region.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-white/40 uppercase mb-1">Recommended Action</p>
                            <p className="text-sm font-bold">Update vendor commission caps in Sector 4</p>
                        </div>
                        <button className="w-full py-3 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 group-hover:scale-[0.98] transition-all">
                            <Zap className="w-4 h-4 fill-black" /> APPLY AUTO-ADJUST
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, isPositive, icon }: {
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: React.ReactNode;
}) {
    return (
        <div className="stat-card bg-white/[0.03] border border-white/10 p-6 rounded-[32px] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function VendorRow({ name, sales, health, status }: { name: string; sales: string; health: number; status: string }) {
    return (
        <div className="flex items-center justify-between group/row">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black group-hover/row:bg-white group-hover/row:text-black transition-all">
                    {name[0]}
                </div>
                <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-[10px] font-black text-white/40 uppercase">{status}</p>
                </div>
            </div>
            <div className="text-right flex items-center gap-8">
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase">Sales</p>
                    <p className="text-sm font-black">{sales}</p>
                </div>
                <div className="w-24">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Health {health}%</p>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                health > 90 ? "bg-green-500" : health > 70 ? "bg-primary" : "bg-red-500"
                            )}
                            style={{ width: `${health}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
