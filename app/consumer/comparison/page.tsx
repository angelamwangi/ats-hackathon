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
    TrendingUp,
    Truck,
    Clock,
    Globe,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Link from "next/link";

// Mock Data Generator for Comparison with Kenyan Context
const generateMockComparison = (product: any) => {
    const variance = (base: number, percent: number) => {
        const factor = 1 + (Math.random() * percent * 2 - percent) / 100;
        return Math.floor(base * factor);
    };

    const kenyanLocations = [
        "CBD, Nairobi", "Westlands, Nairobi", "Eastleigh, Nairobi",
        "Nyali, Mombasa", "Mega City, Kisumu", "Thika Road, Kiambu",
        "Nakuru Town", "Eldoret CBD", "Karen, Nairobi"
    ];

    const shopNames = [
        "Nairobi Tech Hub", "Mombasa Deals", "Savannah Electronics",
        "Rift Valley Traders", "Urban Trends KE", "Digital City",
        "Mama Ngina Imports", "Lakeside Computers"
    ];

    const conditions = ["Brand New", "Refurbished", "Open Box", "Ex-UK"];

    const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    const competitors = [
        {
            source: "Retail Nexus",
            logo: "N",
            price: product.price,
            shipping: 0,
            deliveryDays: 1,
            trustScore: 9.9,
            returnPolicy: "30 Days Free",
            location: "Warehouses Countrywide",
            condition: "Brand New",
            warranty: "2 Years",
            isWinner: true,
            color: "bg-primary text-black",
            url: `/consumer/product/${product._id}`
        },
        {
            source: "Jumia",
            logo: "J",
            price: variance(product.price, 12),
            shipping: variance(250, 50),
            deliveryDays: variance(4, 2),
            trustScore: 8.8,
            returnPolicy: "14 Days",
            location: "Nairobi Warehouse",
            condition: "Brand New",
            warranty: "1 Year",
            isWinner: false,
            color: "bg-orange-500 text-white",
            url: "#"
        }
    ];

    // Add 2 random local shops
    for (let i = 0; i < 2; i++) {
        const shop = getRandomItem(shopNames);
        competitors.push({
            source: shop,
            logo: shop[0],
            price: variance(product.price * 1.05, 15),
            shipping: variance(500, 200),
            deliveryDays: variance(5, 3),
            trustScore: Number((7 + Math.random() * 2.5).toFixed(1)),
            returnPolicy: Math.random() > 0.5 ? "7 Days" : "No Returns",
            location: getRandomItem(kenyanLocations),
            condition: getRandomItem(conditions),
            warranty: Math.random() > 0.5 ? "6 Months" : "None",
            isWinner: false,
            color: "bg-gray-700 text-white",
            url: "#"
        });
    }

    // Sort by total price (Price + Shipping)
    return competitors.sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));
};

export default function ComparisonPage() {
    const containerRef = useRef(null);
    const products = useQuery(api.products.getProducts, {}) || [];
    const [compareList, setCompareList] = useState<any[]>([]);

    const addToCompare = (product: any) => {
        if (compareList.length >= 3) return;
        if (compareList.find(p => p._id === product._id)) return;
        // Enrich product with mock comparison data
        const enriched = { ...product, comparisons: generateMockComparison(product) };
        setCompareList([...compareList, enriched]);
    };

    const removeFromCompare = (id: any) => {
        setCompareList(compareList.filter(p => p._id !== id));
    };

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <header className="mb-12">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 uppercase">Global Intelligence</h2>
                <p className="text-gray-400 max-w-2xl text-lg font-medium leading-relaxed">
                    We scrape the entire internet (Amazon, Jumia, Kilimall) to prove that <span className="text-primary italic">Retail Nexus</span> always offers the best landed cost.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Product Picker */}
                <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-4">Available for Analysis</h4>
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {products.map((product: any) => (
                            <button
                                key={product._id}
                                onClick={() => addToCompare(product)}
                                disabled={compareList.length >= 3 || !!compareList.find(p => p._id === product._id)}
                                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left group disabled:opacity-20 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-bold text-sm truncate max-w-[150px] text-gray-200 group-hover:text-white">{product.name}</p>
                                    <p className="text-[10px] font-black text-gray-500 group-hover:text-primary uppercase">KSh {Math.floor(product.price).toLocaleString()}</p>
                                </div>
                                <Plus className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Area */}
                <div className="lg:col-span-3">
                    {compareList.length === 0 ? (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-30 text-center p-8">
                            <Globe className="w-16 h-16 mb-6 text-primary animate-pulse" />
                            <h3 className="text-2xl font-black uppercase mb-2">Initiate Analysis</h3>
                            <p className="font-medium max-w-sm">Select products from the left to start a real-time global price comparison.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {compareList.map((product) => (
                                <ComparisonCard key={product._id} product={product} onRemove={() => removeFromCompare(product._id)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ComparisonCard({ product, onRemove }: { product: any; onRemove: () => void }) {
    return (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] overflow-hidden relative">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden shrink-0">
                        <img src={product.images?.[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase text-gray-400">{product.category}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                                <Star className="w-3 h-3 fill-yellow-500" /> {product.qualityRating}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="p-2 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase font-black text-gray-500 tracking-widest">
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4 text-left">Location</th>
                            <th className="px-6 py-4 text-center">Condition</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-right">Shipping</th>
                            <th className="px-6 py-4 text-center">Delivery</th>
                            <th className="px-6 py-4 text-center">Trust</th>
                            <th className="px-6 py-4 text-right">Landed Cost</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {product.comparisons.map((item: any, idx: number) => {
                            const total = item.price + item.shipping;
                            // Check if this item is the calculated winner (lowest total)
                            const isCheapest = product.comparisons[0] === item;

                            return (
                                <tr key={item.source} className={cn(
                                    "transition-colors hover:bg-white/[0.02]",
                                    item.source === "Retail Nexus" ? "bg-primary/5" : ""
                                )}>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0", item.color)}>
                                                {item.logo}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none mb-1">{item.source}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{item.returnPolicy}</p>
                                            </div>
                                            {item.source === "Retail Nexus" && (
                                                <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 text-[9px] font-black uppercase rounded">Start Here</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-left text-xs font-bold text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="w-3 h-3 text-gray-600" />
                                            {item.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={cn(
                                            "text-[10px] uppercase font-black px-2 py-1 rounded",
                                            item.condition === "Brand New" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                        )}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right font-medium text-gray-400">
                                        KSh {Math.floor(item.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-6 text-right font-medium text-gray-400">
                                        {item.shipping === 0 ? <span className="text-green-500 font-bold">FREE</span> : `KSh ${item.shipping}`}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-300">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            {item.deliveryDays} Days
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full">
                                            <ShieldCheck className={cn("w-3 h-3", item.trustScore > 9 ? "text-green-500" : "text-yellow-500")} />
                                            <span className="text-xs font-bold">{item.trustScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <p className={cn("text-lg font-black", item.source === "Retail Nexus" || isCheapest ? "text-white" : "text-gray-500")}>
                                            KSh {Math.floor(total).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        {item.source === "Retail Nexus" ? (
                                            <Link href={item.url} className="px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-colors">
                                                BUY
                                            </Link>
                                        ) : (
                                            <button className="px-4 py-2 border border-white/10 text-gray-500 text-xs font-black rounded-xl hover:bg-white/5 transition-colors cursor-not-allowed">
                                                EXTERNAL
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

