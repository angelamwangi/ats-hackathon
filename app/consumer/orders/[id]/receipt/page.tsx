"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
// Actually, to avoid new deps, I'll just use a barcode font or simple ID display.
// User didn't ask for QR specifically, just a ticket.

export default function ReceiptPage() {
    const params = useParams();
    const orderId = params.id as string;
    const order = useQuery(api.orders.getOrder, { orderId: orderId as any });

    if (!order) {
        return <div className="p-8 text-black">Loading ticket...</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black p-8 font-mono flex flex-col items-center">
            <div className="max-w-md w-full border-2 border-black p-8 bg-white shadow-2xl printable-area">
                <header className="text-center mb-8 border-b-2 border-black pb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">NEXUS MARKET</h1>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Official Acquisition Receipt</p>
                </header>

                <div className="mb-8 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-bold opacity-60">ORDER ID</span>
                        <span className="font-black">#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold opacity-60">DATE</span>
                        <span className="font-black">{new Date(order._creationTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold opacity-60">CUSTOMER</span>
                        <span className="font-black">User #{order.customerId?.slice(-4) || "GUEST"}</span>
                    </div>
                </div>

                <div className="border-t-2 border-b-2 border-black py-8 mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest border-b border-dashed border-black">
                                <th className="pb-2 opacity-60">Item</th>
                                <th className="pb-2 opacity-60 text-right">Qty</th>
                                <th className="pb-2 opacity-60 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            {order.items.map((item: any) => (
                                <tr key={item.productId} className="border-b border-dashed border-black/20">
                                    <td className="py-2 pr-2">{item.product?.name || "Unknown Item"}</td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">${item.priceAtSale.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4 mb-12">
                    <div className="flex justify-between text-lg font-black uppercase">
                        <span>Total Paid</span>
                        <span>${order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase opacity-60">
                        <span>Points Earned</span>
                        <span>+{Math.floor(order.totalAmount / 10)} PTS</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="bg-black text-white p-4 font-black text-2xl tracking-widest uppercase">
                        PAID IN FULL
                    </div>
                </div>

                <footer className="text-center text-[10px] font-bold opacity-40 uppercase tracking-widest space-y-2">
                    <p>Thank you for shopping with Nexus.</p>
                    <p>This entry serves as your proof of ownership.</p>
                </footer>
            </div>

            <button
                onClick={() => window.print()}
                className="mt-8 px-8 py-3 bg-black text-white font-black rounded-full uppercase tracking-widest hover:scale-105 active:scale-95 transition-all print:hidden"
            >
                Print Ticket
            </button>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    .print\\:hidden { display: none; }
                }
            `}</style>
        </div>
    );
}
