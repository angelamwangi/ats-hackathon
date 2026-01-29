"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MoveRight, Zap, Ghost, Compass } from "lucide-react";

export default function NotFound() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".ghost", {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

            gsap.fromTo(".not-found-content > *",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 1,
                    ease: "power4.out"
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]" />

            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 blur-[150px] rounded-full animate-pulse delay-700" />

            <div className="not-found-content relative z-10 flex flex-col items-center text-center">
                <div className="ghost mb-8 text-primary">
                    <Compass className="w-24 h-24 stroke-[1px]" />
                </div>

                <p className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-primary" /> Signal Lost in Nexus
                </p>

                <h1 className="text-[12rem] font-black leading-none tracking-tighter mb-4 opacity-10 select-none">404</h1>

                <h2 className="text-4xl font-black uppercase tracking-tight mb-6 max-w-lg">
                    This sector is currently outside our monitoring range.
                </h2>

                <p className="text-white font-medium max-w-md mb-12 leading-relaxed">
                    The resource you requested might have been moved, deleted, or is currently undergoing a deep-sync operation.
                </p>

                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all flex items-center gap-3 group"
                    >
                        RETURN TO NEXUS <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/help"
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
                    >
                        REPORT ANOMALY
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-white uppercase tracking-widest italic">System Status: Re-mapping Universe...</p>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/3 animate-[loading_3s_infinite_linear]" />
                </div>
            </div>

            <style jsx>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
        </div>
    );
}

