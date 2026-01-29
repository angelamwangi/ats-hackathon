"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Loader2, CreditCard, ChevronRight, Hash, DollarSign } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VendorPaymentsPage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");

    const payments = useQuery(api.payments.getVendorPayments, vendor ? { vendorId: vendor._id } : "skip");

    if (!user || vendor === undefined || payments === undefined) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-zinc-800 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Accessing Ledger...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-[48px] text-center">
                <CreditCard className="w-12 h-12 text-zinc-700 mb-6" />
                <p className="text-white font-black uppercase tracking-widest">No vendor account found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 p-6 pb-20 bg-black min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                        Payment <span className="text-primary not-italic">Ledger</span>
                    </h1>
                    <p className="text-zinc-300 font-medium mt-6 max-w-lg text-sm">
                        Comprehensive transaction transparency and real-time settlement tracking.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Volume</span>
                        <span className="text-xl font-black text-white tracking-tighter">KSh {Math.floor(payments?.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0) || 0).toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <div className="bg-zinc-900 border border-zinc-700 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-zinc-800 bg-zinc-900">
                    <h3 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter text-white">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Settlement Stream
                    </h3>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2">
                        Real-time verification of all digital and physical capital inflows.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-950 border-b border-zinc-800">
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Timestamp</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">ID & Trace</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Protocol</th>
                                <th className="px-10 py-6 text-[10px) font-black text-zinc-600 uppercase tracking-[0.3em]">Capital</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">State</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] text-right">Artifact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {payments?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Hash className="w-12 h-12 text-zinc-800" />
                                            <p className="text-xs font-black uppercase tracking-widest text-white">No transactions found in this cycle.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments?.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-zinc-800 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white">{new Date(payment.timestamp).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{new Date(payment.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] bg-black px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                                                    {payment.transactionId || "INTERNAL_X_REF"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                payment.method === "mpesa"
                                                    ? "bg-zinc-950 border-green-900 text-green-500"
                                                    : "bg-zinc-950 border-zinc-700 text-white"
                                            )}>
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-1">
                                                <span className="text-lg font-black text-white tracking-tighter">KSh {Math.floor(payment.amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg",
                                                payment.status === "completed"
                                                    ? "bg-primary text-black"
                                                    : "bg-red-600 text-white"
                                            )}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {payment.orderId && (
                                                <Link
                                                    href={`/receipt/${payment.orderId}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black text-white hover:bg-white hover:text-black transition-all group/link shadow-inner"
                                                >
                                                    EXPLORE <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
