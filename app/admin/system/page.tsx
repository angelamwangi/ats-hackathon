"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    Activity,
    Database,
    Cloud,
    Wifi,
    ShieldCheck,
    Terminal,
    Cpu,
    Zap,
    Clock,
    ArrowUpRight,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSystemPage() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(".system-card", {
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
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-500 uppercase tracking-widest w-fit">
                    <Activity className="w-3 h-3" /> ALL SYSTEMS OPERATIONAL
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase">SYSTEM HEALTH</h1>
                <p className="text-white font-medium">Monitoring Convex-to-SQLite synchronization and API latency.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <HealthMetric title="Convex Cloud" status="Operational" latency="24ms" icon={<Cloud className="w-5 h-5" />} isHealthy />
                <HealthMetric title="SQLite OPFS" status="Active" latency="2ms" icon={<Database className="w-5 h-5" />} isHealthy />
                <HealthMetric title="Clerk Auth" status="Operational" latency="42ms" icon={<ShieldCheck className="w-5 h-5" />} isHealthy />
                <HealthMetric title="Local Sync" status="Healthy" latency="120ms" icon={<RefreshCw className="w-5 h-5" />} isHealthy />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sync Traffic */}
                <div className="system-card lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xl font-black tracking-tight uppercase">SYNC TRAFFIC (OPS)</h3>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> 124 mutations/min
                        </span>
                    </div>

                    <div className="h-64 flex items-end gap-2 px-4 border-b border-white/5 pb-8 mb-8">
                        {[45, 67, 34, 89, 56, 42, 98, 76, 54, 88, 32, 65, 90, 44, 76, 54, 88, 32, 65, 90, 100].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative group/bar"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-black px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none">
                                    {h}ms
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Global Peak Sync 14:02 PM</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                                <Zap className="w-3 h-3 fill-primary" /> Low Latency Mode
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Logs */}
                <div className="system-card bg-black/40 border border-white/10 rounded-[48px] p-8 flex flex-col font-mono">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black tracking-tight uppercase">LIVE SYSTEM LOGS</h3>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar text-[10px]">
                        <LogLine time="16:04:12" msg="SYNC_COMPLETE - V_ID: nexus_dist_01" type="success" />
                        <LogLine time="16:04:15" msg="CACHE_INVALIDATED - P_ID: iphone_15_p" type="info" />
                        <LogLine time="16:04:22" msg="CLERK_SESSION_REFRESHED - U_ID: user_442" type="info" />
                        <LogLine time="16:04:30" msg="API_LATENCY_SPIKE - 422ms (Cloudflare)" type="error" />
                        <LogLine time="16:04:45" msg="DB_VACUUM_FINISHED - localdb.sqlite" type="success" />
                        <LogLine time="16:05:01" msg="SYNC_HEARTBEAT - Healthy" type="success" />
                    </div>

                    <button className="mt-8 w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        EXPORT ARCHIVE
                    </button>
                </div>
            </div>
        </div>
    );
}

function HealthMetric({ title, status, latency, icon, isHealthy }: any) {
    return (
        <div className="system-card p-6 bg-white/[0.03] border border-white/10 rounded-3xl group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    {icon}
                </div>
                {isHealthy && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline justify-between">
                    <p className="text-xl font-black tracking-tight">{status}</p>
                    <p className="text-[10px] font-bold text-white">{latency}</p>
                </div>
            </div>
        </div>
    )
}

function LogLine({ time, msg, type }: any) {
    return (
        <div className="flex gap-3 border-b border-white/5 pb-2">
            <span className="text-white shrink-0">[{time}]</span>
            <span className={cn(
                "font-black uppercase tracking-tighter",
                type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-primary"
            )}>{msg}</span>
        </div>
    )
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    )
}

