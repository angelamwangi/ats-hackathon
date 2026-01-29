"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    ArrowLeft,
    ShieldCheck,
    Zap,
    Wallet,
    Star,
    History,
    ShoppingCart,
    CheckCircle2,
    Info,
    ArrowRightLeft,
    Sparkles,
    Search
} from "lucide-react";
import { useAction } from "convex/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { Recommendations } from "@/components/recommendations";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const product = useQuery(api.products.getProducts, {})?.find((p: any) => p._id === params.id as any);
    const { user, isLoaded } = useUser();
    const storeVisit = useMutation(api.products.logProductVisit);
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");

    // Cart actions
    const addToCart = useMutation(api.cart.addToCart);
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = async () => {
        if (!currentUser || !product) return;

        if (isBnpl) {
            posthog.capture("bnpl_initiated", {
                product_id: product._id,
                product_name: product.name,
                product_price: product.price,
                category: product.category
            });
            router.push(`/consumer/save-to-buy/${product._id}`);
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart({
                userId: currentUser._id,
                productId: product._id,
                quantity: 1
            });

            // Track add to cart event
            posthog.capture("product_added_to_cart", {
                product_id: product._id,
                product_name: product.name,
                product_price: product.price,
                category: product.category,
                quantity: 1
            });

            // Simple feedback for now
            if (window.confirm("Item added to Nexus Cart. Proceed to Marketplace for checkout?")) {
                router.push("/consumer/marketplace");
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            alert("Failed to add.");
        } finally {
            setAddingToCart(false);
        }
    };

    const [isBnpl, setIsBnpl] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    // AI Market Intel
    const comparePrices = useAction(api.market_actions.compareCompetitorPrices);
    const marketIntel = useQuery(api.market_intel.getMarketIntelligence, product ? { productId: product._id } : "skip");
    const [intelLoading, setIntelLoading] = useState(false);

    const handleCompare = async () => {
        if (!product) return;
        setIntelLoading(true);
        try {
            await comparePrices({ productId: product._id });
        } catch (e) {
            console.error(e);
        } finally {
            setIntelLoading(false);
        }
    };

    useEffect(() => {
        if (product && currentUser) {
            // Log visit in Convex for AI context
            storeVisit({
                productId: product._id,
                userId: currentUser._id
            });

            // Track event in PostHog
            posthog.capture("product_viewed", {
                product_id: product._id,
                product_name: product.name,
                category: product.category,
                price: product.price
            });
        }
    }, [product, currentUser, storeVisit]);

    if (!product) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const images = product.images || ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"];

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white hover:text-white transition-colors mb-12 text-sm font-bold tracking-widest uppercase"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Product Visuals */}
                <div className="space-y-6">
                    <div className="aspect-[4/3] bg-white/5 border border-white/10 rounded-[48px] overflow-hidden group relative">
                        <img
                            src={images[activeImage]}
                            alt={product.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        <div className="absolute top-8 left-8 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                            <ShieldCheck className="w-4 h-4 text-primary" /> Nexus Certified Origin
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        {images.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={cn(
                                    "aspect-square bg-white/5 border rounded-3xl overflow-hidden transition-all",
                                    activeImage === i ? "border-primary" : "border-white/5 hover:border-white/20"
                                )}
                            >
                                <img src={img} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <header className="mb-8">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                            <Star className="w-3 h-3 fill-primary" /> PREMIUM QUALITY STOCK
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-4xl font-black">${product.price}</p>
                            <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                Instock: {product.stock} units
                            </div>
                        </div>
                    </header>

                    <div className="space-y-8 flex-1">
                        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">Acquisition Model</h3>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setIsBnpl(false)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                            !isBnpl ? "bg-white text-black" : "text-white hover:text-white"
                                        )}
                                    >
                                        Direct Buy
                                    </button>
                                    <button
                                        onClick={() => setIsBnpl(true)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                            isBnpl ? "bg-primary text-black font-black" : "text-white hover:text-white"
                                        )}
                                    >
                                        Save-to-Buy
                                    </button>
                                </div>
                            </div>

                            {isBnpl ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-sm text-white leading-relaxed">
                                        Start with a small deposit today. We&apos;ll hold your item and earn loyalty points as you complete your goal.
                                        <span className="text-primary font-bold ml-1 italic">95% refundable if you cancel.</span>
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                            <p className="text-[10px] font-black text-primary uppercase mb-1">Weekly Goal</p>
                                            <p className="text-xl font-black">${(product.price / 4).toFixed(2)}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[10px] font-black text-white uppercase mb-1">Duration</p>
                                            <p className="text-xl font-black">4 Weeks</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-sm text-white leading-relaxed">
                                        Immediate ownership and fulfillment. Earn 2% back in Nexus loyalty points.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <SignedIn>
                                {/* If signed in but no Convex User (currentUser), they need to complete setup */}
                                {isLoaded && user && !currentUser ? (
                                    <Link href="/sign-in?role=customer" className="col-span-2 py-5 bg-primary text-black font-black rounded-[24px] text-sm tracking-widest uppercase hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        COMPLETE SETUP TO BUY
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                            className={cn(
                                                "py-5 rounded-[24px] font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                                                isBnpl ? "bg-primary text-black hover:bg-primary/90" : "bg-white text-black hover:bg-white/90",
                                                addingToCart && "opacity-50 cursor-wait"
                                            )}>
                                            {addingToCart ? (
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                isBnpl ? <Wallet className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />
                                            )}
                                            {addingToCart ? "PROCESSING..." : (isBnpl ? "START SAVING JAR" : "COMPLETE PURCHASE")}
                                        </button>
                                        <button className="py-5 bg-white/5 border border-white/10 rounded-[24px] font-black text-sm tracking-widest uppercase hover:bg-white/10 transition-all">
                                            ADD TO WISHLIST
                                        </button>
                                    </>
                                )}
                            </SignedIn>

                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className={cn(
                                        "py-5 rounded-[24px] font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                                        isBnpl ? "bg-primary text-black hover:bg-primary/90" : "bg-white text-black hover:bg-white/90"
                                    )}>
                                        {isBnpl ? <Wallet className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                                        LOGIN TO {isBnpl ? "START SAVING" : "PURCHASE"}
                                    </button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <button className="py-5 bg-white/5 border border-white/10 rounded-[24px] font-black text-sm tracking-widest uppercase hover:bg-white/10 transition-all">
                                        LOGIN TO WISHLIST
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>

                    <aside className="mt-12 pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
                        <div className="flex gap-4 group/eco">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover/eco:animate-spin-slow">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase">Circular Value</p>
                                <p className="text-sm font-bold">
                                    Buy-Back: <span className="text-primary">${product.buyBackValue || (product.price * 0.4).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase">Warranty</p>
                                <p className="text-sm font-bold">Nexus Guard+ Included</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* AI Market Intelligence Panel */}
            <section className="mt-20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">MARKET <span className="text-primary not-italic">INTELLIGENCE</span></h2>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Cross-platform semantic price verification powered by Gemini</p>
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={intelLoading}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                    >
                        {intelLoading ? <Sparkles className="w-3 h-3 animate-spin text-primary" /> : <Search className="w-3 h-3" />}
                        {intelLoading ? "CONSULTING GEMINI..." : "REFRESH MARKET INDEX"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {!marketIntel ? (
                        <div className="md:col-span-3 h-48 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                            <Info className="w-8 h-8 mb-4 text-white" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Scan market to compare prices</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] flex flex-col justify-center">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Market Position</p>
                                <div className="flex items-end gap-3">
                                    <p className={cn(
                                        "text-5xl font-black tracking-tighter",
                                        marketIntel.marketSummary.priceDifferencePercentage < 0 ? "text-primary" : "text-red-500"
                                    )}>
                                        {marketIntel.marketSummary.priceDifferencePercentage > 0 ? "+" : ""}
                                        {marketIntel.marketSummary.priceDifferencePercentage}%
                                    </p>
                                    <p className="text-[10px] font-black text-white leading-snug mb-2 uppercase">
                                        Value vs.<br />Market Low
                                    </p>
                                </div>
                                <p className="text-[10px] text-white mt-6 font-bold uppercase tracking-widest">
                                    Global Base: <span className="text-white">${marketIntel.marketSummary.lowestCompetitorPrice} / USD</span>
                                </p>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                {marketIntel.matches.map((match: any, i: number) => (
                                    <div key={i} className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] flex items-center justify-between group hover:border-white/20 transition-all cursor-default">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className={cn(
                                                    "w-1 h-12 rounded-full transition-all duration-700",
                                                    match.matchConfidence > 0.9 ? "bg-primary shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-orange-500"
                                                )} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{match.competitorName}</p>
                                                <p className="text-xl font-black">${match.price.toFixed(2)} <span className="text-xs text-white italic uppercase">{match.currency}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex-1 px-12 hidden sm:block">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000 ease-out",
                                                            match.matchConfidence > 0.9 ? "bg-primary" : "bg-orange-500"
                                                        )}
                                                        style={{ width: `${match.matchConfidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[8px] font-black text-white uppercase">{(match.matchConfidence * 100).toFixed(0)}% MATCH</span>
                                            </div>
                                            <p className="text-[9px] text-white font-bold uppercase tracking-tighter line-clamp-1">{match.reasoning}</p>
                                        </div>

                                        <a
                                            href={match.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                                        >
                                            Verify
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {product.predictedUsageMonths && (
                <div className="mt-20 p-8 bg-primary/5 border border-primary/20 rounded-[40px] flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <Sparkles className="w-10 h-10 text-primary animate-pulse relative z-10" />
                    <div className="relative z-10">
                        <p className="text-sm font-black text-white uppercase tracking-widest">AI REPLENISHMENT ENABLED</p>
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest mt-1">Nudging acquisition at 80% consumption window (approx. {product.predictedUsageMonths * 30} days).</p>
                    </div>
                </div>
            )}

            <div className="mt-32 pt-32 border-t border-white/5">
                {currentUser && <Recommendations userId={currentUser._id} />}
            </div>
        </div>
    );
}
