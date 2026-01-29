"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Clock,
    Zap,
    TrendingUp,
    Wallet,
    ShieldCheck,
    X
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export default function BNPLTrackerPage() {
    const { user, isLoaded } = useUser();
    const containerRef = useRef(null);
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const allPlans = useQuery(api.bnpl.getMyPlans, currentUser ? { userId: currentUser._id } : "skip") || [];

    // Split plans into active and completed
    const activePlans = allPlans.filter((p: any) => p.status === "active");
    const completedPlans = allPlans.filter((p: any) => p.status === "completed");

    useEffect(() => {
        if (activePlans.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".bnpl-card",
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
        }
    }, [activePlans]);

    if (!isLoaded || !currentUser) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black tracking-tight mb-4 uppercase">SAVE-TO-BUY</h2>
                    <p className="text-white/40 max-w-xl text-lg font-medium leading-relaxed">
                        Track your progressive payments. Items are automatically fulfilled once your savings reach 100%.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">Total Escrow</p>
                        <p className="text-2xl font-black">
                            ${allPlans.reduce((acc: number, curr: any) => acc + curr.amountPaid, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activePlans.length === 0 ? (
                    <div className="col-span-2 p-12 border border-dashed border-white/10 rounded-[40px] text-center">
                        <p className="text-white/40 font-bold uppercase tracking-widest">No active savings plans</p>
                    </div>
                ) : (
                    activePlans.map((order: any) => (
                        <BNPLCard
                            key={order._id}
                            id={order._id}
                            name={order.product?.name || "Product"}
                            total={order.totalPrice}
                            paid={order.amountPaid}
                            image={order.product?.images?.[0] || ""}
                        />
                    ))
                )}
            </div>

            <section className="mt-20">
                <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-white/40">COMPLETED ACQUISITIONS</h3>
                <div className="space-y-4">
                    {completedPlans.length === 0 ? (
                        <div className="p-8 text-center text-white/20 text-sm font-bold uppercase tracking-widest">
                            No completed acquisitions yet
                        </div>
                    ) : (
                        completedPlans.map((plan: any) => (
                            <CompletedRow
                                key={plan._id}
                                name={plan.product?.name || "Unknown Product"}
                                date={new Date(plan.startDate).toLocaleDateString()}
                                amount={`$${plan.amountPaid.toLocaleString()}`}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

function BNPLCard({ id, name, total, paid, image }: { id: string, name: string; total: number; paid: number; image: string }) {
    const percentage = Math.round((paid / total) * 100);
    const remaining = total - paid;
    const [amount, setAmount] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Use the simulation mutation for now
    const makePayment = useMutation(api.bnpl.makePayment);
    const cancelPlan = useMutation(api.bnpl.cancelPlan);

    const handlePayment = async () => {
        if (!amount) return;
        setLoading(true);
        try {
            await makePayment({ planId: id as any, amount: parseFloat(amount) });
            setOpen(false);
            setAmount("");
            alert("Payment Successful! (Simulation)");
        } catch (e) {
            console.error(e);
            alert("Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bnpl-card bg-white/[0.03] border border-white/10 rounded-[40px] p-8 hover:border-white/20 transition-all flex flex-col md:flex-row gap-8 group">
            <div className="w-full md:w-32 h-32 rounded-3xl overflow-hidden bg-white/5 shrink-0">
                <img src={image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={name} />
            </div>

            <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black mb-1">{name}</h3>
                        <p className="text-sm text-white/40 font-bold">Total Target: ${total.toLocaleString()}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-1">
                        <span className="text-white">Progress</span>
                        <span className="text-primary">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                        <p className="text-[10px] font-black text-white/40 uppercase">Saved</p>
                        <p className="text-xl font-black">${paid.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase">Remaining</p>
                        <p className="text-xl font-black text-white/40">${remaining.toLocaleString()}</p>
                    </div>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                    MAKE A DEPOSIT <ArrowRight className="w-4 h-4" />
                </button>

                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-[#111] border border-white/10 rounded-[32px] w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Make a Deposit</h3>
                                <p className="text-white/40 text-sm mt-1">Add funds to your savings jar.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Amount (USD) - Max: ${remaining.toFixed(2)}</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (val <= remaining) {
                                                setAmount(e.target.value);
                                            } else if (e.target.value === "") {
                                                setAmount("");
                                            }
                                        }}
                                        max={remaining}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-bold outline-none focus:border-primary transition-colors text-white"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full py-4 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Pay with M-Pesa"}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to cancel this savings plan?")) {
                                            await cancelPlan({ planId: id as any });
                                            setOpen(false);
                                        }
                                    }}
                                    className="w-full py-2 bg-transparent text-red-500 font-bold text-xs hover:text-red-400 transition-colors uppercase tracking-widest"
                                >
                                    Cancel Plan
                                </button>

                                <p className="text-[10px] text-white/20 text-center font-bold uppercase">
                                    Secured by Daraja API • Simulation Mode
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CompletedRow({ name, date, amount }: { name: string; date: string; amount: string }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-[10px] font-black text-white/40 uppercase">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase">Total Paid</p>
                    <p className="text-sm font-black">{amount}</p>
                </div>
                <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black transition-all">
                    VIEW RECEIPT
                </button>
            </div>
        </div>
    );
}
