"use client";

import Link from "next/link";
import { Package, Truck, CheckCircle2, MapPin, ArrowRight, ShoppingBag, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrderHistoryPage() {
    const containerRef = useRef(null);
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const orders = useQuery(api.orders.getMyOrders, currentUser ? { userId: currentUser._id } : "skip") || [];

    const activeOrder = orders.find((o: any) => o.status === "pending" || o.status === "in-transit");
    const completedOrders = orders.filter((o: any) => o.status === "completed" || o.status === "delivered");

    useEffect(() => {
        if (containerRef.current && orders.length > 0) {
            gsap.from(".order-card", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, [orders]);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-8 py-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black tracking-tight mb-4 uppercase">ORDER HISTORY</h2>
                    <p className="text-white/40 max-w-xl text-lg font-medium leading-relaxed">
                        Track your active shipments and review your <span className="text-primary italic">Fulfilled Acquisitions</span>.
                    </p>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                    <button className="px-6 py-2 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all">All Orders</button>
                    <button className="px-6 py-2 text-white/40 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">Active</button>
                    <button className="px-6 py-2 text-white/40 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all">Completed</button>
                </div>
            </header>

            <div className="space-y-8">
                {/* Active Order */}
                {activeOrder ? (
                    <div className="order-card bg-primary text-black rounded-[40px] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] -mr-32 -mt-32" />

                        <div className="flex-1 space-y-6 relative z-10">
                            <div className="flex items-center gap-3 bg-black/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Truck className="w-3 h-3" /> {activeOrder.status === "pending" ? "Processing" : "In Transit"}
                            </div>

                            <div>
                                <h3 className="text-3xl font-black tracking-tighter mb-1 uppercase">{activeOrder.items[0]?.product?.name || "Order"}</h3>
                                <p className="text-sm font-bold opacity-60">Order #{activeOrder._id.slice(-6).toUpperCase()} • {activeOrder.items.length} Items</p>
                            </div>

                            <div className="flex items-center gap-8 pt-4 border-t border-black/10">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 opacity-40" />
                                    <span className="text-xs font-black uppercase tracking-tight">Standard Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 opacity-40" />
                                    <span className="text-xs font-black uppercase tracking-tight">Updated recently</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-64 bg-black/10 rounded-3xl p-6 flex flex-col justify-between relative z-10">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-2">Live Tracking</p>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5" />
                                    <p className="text-xs font-bold leading-tight">Order Placed</p>
                                </div>
                                <div className="flex gap-3 opacity-40">
                                    <div className="w-1.5 h-1.5 border border-black rounded-full mt-1.5" />
                                    <p className="text-xs font-bold leading-tight">Preparing for Dispatch</p>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black/80 transition-all">
                                VIEW DETAILS
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 border-dashed border border-white/10 rounded-[40px] text-center text-white/40 font-bold uppercase tracking-widest">
                        No active orders in progress
                    </div>
                )}

                {/* Completed Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedOrders.length === 0 ? (
                        <div className="col-span-2 p-12 text-center text-white/20 font-bold uppercase tracking-widest">
                            No completed orders yet
                        </div>
                    ) : (
                        completedOrders.map((order: any) => (
                            <CompletedOrderCard
                                key={order._id}
                                _id={order._id}
                                name={order.items[0]?.product?.name || "Order"}
                                id={order._id.slice(-6).toUpperCase()}
                                date={new Date(order._creationTime).toLocaleDateString()}
                                price={`$${order.totalAmount.toLocaleString()}`}
                                points={`+${Math.floor(order.totalAmount / 10)}`}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function CompletedOrderCard({ name, id, _id, date, price, points }: any) {
    return (
        <div className="order-card bg-[#111] border border-white/10 rounded-[32px] p-8 hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">#{id}</p>
                    <div className="flex items-center gap-1.5 justify-end text-green-500 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Delivered</span>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h4 className="text-xl font-black tracking-tight mb-1 uppercase text-white">{name}</h4>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{date}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase">Amount</p>
                    <p className="text-lg font-black text-white">{price}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase">Points Earned</p>
                    <p className="text-lg font-black text-primary">{points}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
                <Link href={`/consumer/orders/${_id}/receipt`} target="_blank">
                    <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white">
                        GET RECEIPT
                    </button>
                </Link>
                <button className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white">
                    TRADE IN
                </button>
            </div>
        </div>
    );
}
