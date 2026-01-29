"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Star, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Recommendations({ userId }: { userId: any }) {
    const getRecommendations = useAction(api.recommendations.getPersonalizedRecommendations);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const results = await getRecommendations({ userId });
                setRecommended(results);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [userId, getRecommendations]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-white/5 rounded-3xl" />
                ))}
            </div>
        );
    }

    if (recommended.length === 0) return null;

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">RECOMMENDED FOR YOU</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1 italic text-primary">Powered by Gemini AI</p>
                </div>
                <Link href="/consumer/marketplace" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                    Browse All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommended.map((product) => (
                    <Link
                        key={product._id}
                        href={`/consumer/product/${product._id}`}
                        className="group bg-white/[0.03] border border-white/10 p-6 rounded-[32px] hover:border-primary/50 transition-all flex flex-col"
                    >
                        <div className="aspect-square bg-white/5 rounded-2xl mb-4 overflow-hidden relative">
                            <img
                                src={product.images?.[0] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400"}
                                alt={product.name}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black text-primary border border-primary/20 flex items-center gap-1 uppercase">
                                <Star className="w-2 h-2 fill-primary" /> {product.qualityRating}
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h4>
                        <div className="flex items-center justify-between mt-auto">
                            <p className="font-black">${product.price}</p>
                            <div className="flex items-center gap-1 text-green-500">
                                <span className="text-[10px] font-bold">MATCH</span>
                                <TrendingUp className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
