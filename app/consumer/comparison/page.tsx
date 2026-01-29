"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    ArrowLeftRight,
    Plus,
    Trash2,
    Zap,
    ShieldCheck,
    Star,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export default function ComparisonPage() {
    const containerRef = useRef(null);
    const products = useQuery(api.products.getProducts, {}) || [];
    const [compareList, setCompareList] = useState<any[]>([]);

    const addToCompare = (product: any) => {
        if (compareList.length >= 3) return;
        if (compareList.find(p => p._id === product._id)) return;
        setCompareList([...compareList, product]);
    };

    const removeFromCompare = (id: any) => {
        setCompareList(compareList.filter(p => p._id !== id));
    };

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
            <header className="mb-12">
                <h2 className="text-5xl font-black tracking-tight mb-4 uppercase">COMPARISON ENGINE</h2>
                <p className="text-white max-w-xl text-lg font-medium leading-relaxed">
                    Drag and drop products here to analyze <span className="text-primary italic">Quality and Price</span> disparities across the platform.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Product Picker */}
                <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest pl-4">Available for Analysis</h4>
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {products.map((product: any) => (
                            <button
                                key={product._id}
                                onClick={() => addToCompare(product)}
                                disabled={compareList.length >= 3 || !!compareList.find(p => p._id === product._id)}
                                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left group disabled:opacity-20"
                            >
                                <p className="font-bold text-sm truncate">{product.name}</p>
                                <p className="text-[10px] font-black text-white uppercase">${product.price}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {compareList.length === 0 ? (
                            <div className="md:col-span-3 h-[400px] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-20">
                                <ArrowLeftRight className="w-12 h-12 mb-4" />
                                <p className="font-bold">Select up to 3 products to compare</p>
                            </div>
                        ) : (
                            compareList.map((product) => (
                                <CompareColumn key={product._id} product={product} onRemove={() => removeFromCompare(product._id)} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";

// ... inside ComparisonPage component

function CompareColumn({ product, onRemove }: { product: any; onRemove: () => void }) {
    const qScore = product.qualityRating || 0;

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 flex flex-col relative group">
            <button
                onClick={onRemove}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white hover:text-red-500 hover:bg-red-500/10 transition-all z-20"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <Link href={`/consumer/product/${product._id}`} className="mb-8 pt-4 block group/link">
                <span className="text-[10px] font-black uppercase text-white tracking-widest">{product.category}</span>
                <h3 className="text-xl font-bold leading-tight mt-1 group-hover/link:text-primary transition-colors">{product.name}</h3>
            </Link>

            <div className="space-y-8 flex-1">
                <div className="p-4 bg-white/5 rounded-3xl">
                    <p className="text-[10px] font-black text-white uppercase mb-2">Price Point</p>
                    <p className="text-3xl font-black">${product.price}</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-white uppercase">Quality Score</p>
                        <p className="text-lg font-black text-primary">{qScore}/10</p>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${qScore * 10}%` }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-white uppercase">Platform Trust</p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>Nexus Verified</span>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <Link href={`/consumer/product/${product._id}`} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2">
                    VIEW FULL DETAILS <Zap className="w-4 h-4 fill-black" />
                </Link>
            </div>
        </div>
    );
}

