"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Calendar, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SaveToBuyConfigPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Fetch product (client-side filter for now)
    const product = useQuery(api.products.getProducts, {})?.find((p: any) => p._id === params.productId as any);
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");

    const createPlan = useMutation(api.bnpl.createPlan);

    const [duration, setDuration] = useState(3); // Months
    const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("weekly");
    const [loading, setLoading] = useState(false);

    if (!isLoaded || !product) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Calculations
    const startDate = new Date(); // Today
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + duration);

    const totalDays = duration * 30; // approx
    let numPayments = 1;
    let intervalLabel = "";

    switch (interval) {
        case "daily":
            numPayments = totalDays;
            intervalLabel = "Day";
            break;
        case "weekly":
            numPayments = Math.ceil(totalDays / 7);
            intervalLabel = "Week";
            break;
        case "monthly":
            numPayments = duration;
            intervalLabel = "Month";
            break;
    }

    const installmentAmount = product.price / numPayments;

    const handleActivate = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await createPlan({
                userId: currentUser._id,
                productId: product._id,
                totalPrice: product.price,
                planDuration: duration,
                paymentInterval: interval,
                installmentAmount: installmentAmount,
                startDate: Date.now(),
            });
            router.push("/consumer/bnpl");
        } catch (error) {
            console.error(error);
            alert("Failed to create plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-sm font-bold tracking-widest uppercase"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel Plan
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Product */}
                    <div className="space-y-8">
                        <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-white/10 relative">
                            <img
                                src={product.images ? product.images[0] : ""}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-8 left-8">
                                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{product.name}</h1>
                                <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Goal-Based Savings</p>
                                    <p className="text-sm text-white/40">Item reserved immediately. Ships when 100% paid.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Config */}
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[40px] space-y-10">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Configure Plan</h2>
                            <p className="text-white/40">Customize your "Lipa Mdogo Mdogo" schedule.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-sm font-bold uppercase tracking-widest mb-4">
                                    <span>Duration</span>
                                    <span className="text-primary">{duration} Months</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-white/20 mt-2 font-bold uppercase">
                                    <span>1 Mo</span>
                                    <span>12 Mo</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold uppercase tracking-widest mb-4 block">Payment Frequency</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(["daily", "weekly", "monthly"] as const).map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setInterval(opt)}
                                            className={cn(
                                                "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                interval === opt
                                                    ? "bg-primary text-black border-primary"
                                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-black/40 rounded-3xl border border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/40 font-bold uppercase">Installment</span>
                                <span className="text-2xl font-black">${installmentAmount.toFixed(2)} <span className="text-sm text-white/40 font-bold">/ {intervalLabel}</span></span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40 font-bold uppercase">Unlock Date</span>
                                <span className="font-bold text-white">{endDate.toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleActivate}
                            disabled={loading}
                            className={cn(
                                "w-full py-6 bg-white text-black font-black rounded-2xl text-sm tracking-widest uppercase hover:bg-white/90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2",
                                loading && "opacity-50 cursor-wait"
                            )}
                        >
                            {loading ? "Activating Plan..." : "Start Saving Jar"}
                            <Wallet className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
