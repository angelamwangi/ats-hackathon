"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

export default function VendorPaymentsPage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");

    const payments = useQuery(api.payments.getVendorPayments, vendor ? { vendorId: vendor._id } : "skip");

    if (!user || vendor === undefined || payments === undefined) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-dashed border-2 border-white/10 rounded-3xl text-center">
                <p className="text-white">No vendor account found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Payments History</h1>
                    <p className="text-white mt-1">
                        Track and audit all your transactions
                    </p>
                </div>
            </header>

            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-xl">
                <div className="p-6 pb-2">
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Recent Transactions
                    </h3>
                    <p className="text-sm text-white/60">
                        A realtime log of all cash and M-Pesa payments.
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b border-white/5 transition-colors hover:bg-white/50 data-[state=selected]:bg-white/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-white/50 bg-white/5">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-white/50 bg-white/5">Transaction ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-white/50 bg-white/5">Method</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-white/50 bg-white/5">Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-white/50 bg-white/5">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-white/50 bg-white/5 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {payments?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="h-32 text-center text-white">
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payments?.map((payment) => (
                                        <tr key={payment._id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                                            <td className="p-4 align-middle font-medium text-white">
                                                {new Date(payment.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle font-mono text-xs text-white">
                                                {payment.transactionId || "N/A"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize ${payment.method === "mpesa" ? "border-green-500 text-green-500" : "border-white/20 text-white"}`}>
                                                        {payment.method}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-bold text-white">
                                                ${payment.amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase text-[10px] tracking-wider ${payment.status === "completed" ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {payment.orderId && (
                                                    <Link
                                                        href={`/receipt/${payment.orderId}`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        View <ExternalLink className="w-3 h-3" />
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
        </div>
    );
}
