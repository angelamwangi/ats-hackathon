"use client";

import { UserProfile } from "@/components/user-profile";
import { SignInButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCart, LayoutDashboard, Store, ShieldCheck, ArrowRight, Zap, Globe, Cpu } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const products = useQuery(api.products.getProducts, {});
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero Animation: Split Text Feel
      gsap.from(".hero-title-main", {
        y: 120,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1
      });

      gsap.from(".hero-sub-main", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        delay: 0.5,
        ease: "power3.out"
      });

      // Bento Grid Parallax
      gsap.from(".bento-item", {
        scrollTrigger: {
          trigger: ".bento-grid",
          start: "top 85%",
        },
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out"
      });

      // Pulse Sync Animation
      const pulseTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".pulse-showcase",
          start: "top 70%",
          end: "bottom 30%",
          scrub: 1
        }
      });
      pulseTl.to(".stock-alert", { opacity: 0, y: -20, duration: 1 })
        .to(".stock-success", { opacity: 1, y: 0, duration: 1 }, "-=0.2");

      // Progress Bar Section
      gsap.to(".bnpl-progress-bar", {
        scrollTrigger: {
          trigger: ".bnpl-section",
          start: "top 70%",
        },
        width: "100%",
        duration: 2,
        ease: "power4.inOut"
      });

      // Live Curation Reveal
      gsap.from(".product-card-home", {
        scrollTrigger: {
          trigger: ".products-grid-home",
          start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        stagger: 0.1,
        duration: 0.8,
        ease: "expo.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* Dynamic Background Noise/Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Flagship Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 px-8 py-6 backdrop-blur-xl border-b border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-500">
                <div className="w-5 h-5 bg-black rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <span className="hidden md:block">RETAIL <span className="text-white/40 italic">NEXUS</span></span>
            </Link>
            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/30">
              <Link href="/consumer/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
              <Link href="/sign-in?role=vendor" className="hover:text-white transition-colors">Retail OS</Link>
              <Link href="/admin/dashboard" className="hover:text-white transition-colors">Infrastructure</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isLoaded && (
              isSignedIn ? (
                <UserProfile />
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/sign-in" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors px-4">Login</Link>
                  <Link href="/sign-in" className="px-8 py-3.5 bg-white! text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-xl">
                    Start for Free
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section: The Hook */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-40 pb-20 overflow-hidden">
        <div className="max-w-6xl relative z-10">
          <div className="hero-sub-main inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-primary mb-12 backdrop-blur-xl">
            <Zap className="w-3 h-3 fill-primary" /> The OS for Growth
          </div>

          <h2 className="hero-title-main text-7xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] mb-10 uppercase">
            OPERATING<br />
            <span className="text-white/20 italic">SYSTEM</span>
          </h2>

          <p className="hero-sub-main text-xl lg:text-3xl text-white/40 leading-snug mb-20 max-w-3xl mx-auto font-medium tracking-tight">
            One platform to run your <span className="text-white/80">physical shop</span>, launch your <span className="text-white/80">online store</span>, and offer flexible <span className="text-primary">"Save-to-Buy"</span> credit.
          </p>

          <div className="hero-sub-main flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/consumer/marketplace" className="w-full md:w-auto px-16 py-7 bg-white! text-black font-black uppercase tracking-widest rounded-[28px] hover:bg-primary hover:scale-105 transition-all shadow-[0_25px_60px_rgba(255,255,255,0.05)]">
              Start Free Trial
            </Link>
            <Link href="/demo" className="w-full md:w-auto px-16 py-7 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-[28px] hover:bg-white/10 transition-all backdrop-blur-md">
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Floating Mockup (Conceptual) */}
        <div className="absolute inset-x-0 bottom-[-10%] flex justify-center opacity-20 pointer-events-none -z-10">
          <div className="w-[1200px] h-[600px] bg-gradient-to-t from-primary/20 to-transparent rounded-t-full blur-3xl" />
        </div>
      </section>

      {/* 2. The Power of Three (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t border-white/5 bento-grid">
        <div className="text-center mb-24">
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 mb-4">Core Ecosystem</h3>
          <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">THE POWER <span className="text-white/20 italic">OF THREE</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* I. Offline-First POS */}
          <div className="bento-item lg:col-span-12 p-12 rounded-[56px] bg-white/[0.03] border border-white/5 flex flex-col md:flex-row items-center justify-between group overflow-hidden relative">
            <div className="max-w-xl relative z-10">
              <div className="flex gap-2 mb-8">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40 group-hover:text-white transition-colors">Offline Sales</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40">Barcode Scanning</span>
              </div>
              <h4 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
                Internet is optional.<br />
                <span className="text-primary italic">Sales are mandatory.</span>
              </h4>
              <p className="text-white/40 text-lg font-medium leading-relaxed mb-10">
                Never lose a customer to a bad connection. Our SQLite-powered POS works 100% offline and syncs the moment you're back.
              </p>
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                <Cpu className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          </div>

          {/* II. Multi-Vendor Marketplace */}
          <div className="bento-item lg:col-span-7 p-12 rounded-[56px] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-12 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Globe className="w-8 h-8" />
            </div>
            <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">YOUR SHOP,<br /><span className="text-white/20 italic">EVERYWHERE.</span></h4>
            <p className="text-white/40 text-lg font-medium mb-8">Instantly turn your physical inventory into a global online storefront. discovery your quality.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-extrabold tracking-widest border border-white/5">Unified Inventory</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-extrabold tracking-widest border border-white/5">Price Intel</span>
            </div>
          </div>

          {/* III. Save-to-Buy Engine */}
          <div className="bento-item lg:col-span-5 p-12 rounded-[56px] bg-primary text-black group relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-black/10 flex items-center justify-center mb-12">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">CREDIT WITHOUT<br /><span className="text-black/40 italic">THE DEBT.</span></h4>
            <p className="text-black/60 text-lg font-bold mb-8 italic">Empower your customers with a progressive purchase plan. They save; you ship.</p>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* 3. Interactive Feature Showcases */}
      <section className="bg-white/[0.02] border-y border-white/5 py-40 pulse-showcase bnpl-section">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          {/* Pulse Dashboard Preview */}
          <div className="relative">
            <div className="p-8 rounded-[48px] bg-black border border-white/10 shadow-2xl skew-y-3 lg:skew-y-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Vendor Pulse Dashboard</span>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 flex items-center justify-between stock-alert">
                  <div>
                    <h5 className="font-bold mb-1">Bamboo Toothbrush</h5>
                    <p className="text-xs text-red-500 font-black uppercase">Low Stock: 2 Left</p>
                  </div>
                  <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase">Alert</div>
                </div>
                <div className="p-6 rounded-3xl bg-primary/10 flex items-center justify-between opacity-0 translate-y-4 stock-success">
                  <div>
                    <h5 className="font-bold mb-1">Bamboo Toothbrush</h5>
                    <p className="text-xs text-primary font-black uppercase">Restocked: 100 units</p>
                  </div>
                  <div className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase">Healthy</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              BUSINESS <span className="text-white/20 italic">PULSE</span><br />SIMPLIFIED
            </h3>
            <p className="text-white/40 text-lg font-medium mb-12 leading-relaxed">
              Watch your inventory status shift in real-time. Use GSAP-powered intelligence to predict outages before they happen.
            </p>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
              <div className="bnpl-progress-bar h-full bg-primary w-0" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Synchronization: Active</p>
          </div>
        </div>
      </section>

      {/* 4. Comparison Engine (For Consumers) */}
      <section className="max-w-7xl mx-auto px-8 py-40 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              THE BEST <span className="text-white/20 italic">DEAL,</span><br />EVERY TIME
            </h3>
            <p className="text-white/40 text-lg font-medium mb-12 max-w-xl">
              Our Comparison Engine scans every vendor in the Nexus to find the optimal balance of price, quality, and proximity.
            </p>

            {/* Mock Comparison Table */}
            <div className="space-y-4">
              {[
                { name: "Vendor Alpha", price: "$420", quality: "9.8", winner: true },
                { name: "Beta Shop", price: "$445", quality: "9.2", winner: false },
                { name: "Global Mart", price: "$415", quality: "7.5", winner: false },
              ].map((v, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-3xl border transition-all flex items-center justify-between",
                  v.winner ? "bg-primary/5 border-primary/20" : "bg-white/[0.02] border-white/5 opacity-50"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full", v.winner ? "bg-primary" : "bg-white/20")} />
                    <span className="font-bold uppercase tracking-tight">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm font-black text-white/40">{v.price}</span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={cn("w-4 h-4", v.winner ? "text-primary" : "text-white/20")} />
                      <span className="text-xs font-black">{v.quality}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 p-12 rounded-[56px] bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <ShoppingCart className="w-48 h-48 text-white/[0.03]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary blur-[100px] opacity-20" />
          </div>
        </div>
      </section>

      {/* 5. Live Curation (Marketplace Snapshot) */}
      <section className="max-w-7xl mx-auto px-8 py-32 overflow-hidden">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
              VIBRANT <span className="text-white/20 italic">CATALOG</span>
            </h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed">
              Experience the best-performing goods from our global vendor ecosystem.
            </p>
          </div>
          <Link href="/consumer/marketplace" className="group flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
            <span>Explore full platform</span>
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-500">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        <div className="products-grid-home grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!products ? (
            [1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-white/5 rounded-[40px] animate-pulse" />)
          ) : (
            products.slice(0, 4).map((product: any) => (
              <Link key={product._id} href={`/consumer/marketplace`} className="product-card-home group bg-white/[0.02] border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.04] transition-all">
                <div className="aspect-square bg-white/5 rounded-3xl mb-10 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-primary border border-primary/20 uppercase z-10">
                    Value: {product.qualityRating}
                  </div>
                  <ShoppingCart className="w-12 h-12 text-white/5 group-hover:text-primary/20 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-3xl font-black mb-8">${product.price}</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white transition-colors">
                  Analyze Deal <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 5. Sustainability Angle */}
      <section className="px-8 py-40 border-t border-white/5 bg-gradient-to-b from-transparent to-green-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-12">
            <Zap className="w-10 h-10 fill-green-500" />
          </div>
          <h2 className="text-5xl lg:text-[7rem] font-black uppercase tracking-tighter mb-8 leading-[0.85]">
            CIRCULAR<br />
            <span className="text-white/20 italic">ECONOMY</span>
          </h2>
          <p className="text-white/40 text-xl lg:text-2xl font-medium mb-12">
            Don't just sell products; manage their lifecycle. Our platform includes built-in trade-in and recycling modules to keep customers coming back.
          </p>
          <div className="flex justify-center gap-4">
            <span className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">Trade-In Modules</span>
            <span className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">Life-Cycle Tracking</span>
          </div>
        </div>
      </section>

      {/* 6. Footer: The Final Push */}
      <footer className="px-8 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h3 className="text-4xl lg:text-6xl font-black uppercase tracking-tight mb-12 max-w-2xl leading-none">
            Ready to transform the <span className="text-primary italic">retail future</span>?
          </h3>
          <Link href="/sign-in" className="px-20 py-8 bg-white text-black font-black uppercase tracking-widest rounded-[32px] hover:bg-primary transition-all active:scale-95 shadow-2xi text-xl mb-32">
            Enter Nexus OS
          </Link>

          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 text-left pt-32 border-t border-white/5">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">Product</h5>
              <ul className="space-y-4 text-sm font-bold text-white/40">
                <li><Link href="/sign-in?role=vendor" className="hover:text-white transition-colors">Offline POS</Link></li>
                <li><Link href="/consumer/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/consumer/bnpl" className="hover:text-white transition-colors">Save-to-Buy</Link></li>
                <li><Link href="/admin/system" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8">Resources</h5>
              <ul className="space-y-4 text-sm font-bold text-white/40">
                <li><Link href="/support" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">SME Toolkit</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8">Company</h5>
              <ul className="space-y-4 text-sm font-bold text-white/40">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8">
                <div className="w-6 h-6 bg-black rounded-sm rotate-45" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">© 2026 RETAIL NEXUS</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="feature-card group p-10 rounded-[48px] bg-white/[0.03] border border-white/10 hover:border-primary/20 hover:bg-white/[0.05] transition-all duration-500">
      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-black transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
        {title}
      </h3>
      <p className="text-sm font-medium text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}
