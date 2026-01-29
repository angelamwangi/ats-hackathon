"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Truck, X, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNexusDialog } from "@/components/providers/NexusDialogProvider";

export default function VendorOrdersPage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const vendor = useQuery(api.vendors.getVendorByOwnerId, currentUser ? { ownerId: currentUser._id } : "skip");
    const orders = useQuery(api.orders.getVendorOrders, vendor ? { vendorId: vendor._id } : "skip");
    const suppliers = useQuery(api.supplyChain.getSuppliers, vendor ? { vendorId: vendor._id } : "skip");

    if (!user || vendor === undefined || orders === undefined || !currentUser) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return <div className="p-6 text-white font-black italic uppercase tracking-tighter text-center">Register your vendor profile to manage orders.</div>;
    }

    return (
        <div className="space-y-8 p-6 bg-black min-h-screen">
            <header className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-primary w-fit">
                    <Truck className="w-3 h-3" /> SupplyBridge Active
                </div>
                <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap text-white">
                    Order <span className="text-white italic">Management</span>
                </h1>
                <p className="text-white font-medium">Dispatch orders to suppliers and notify all stakeholders via SMS.</p>
            </header>

            <div className="bg-zinc-900 border border-zinc-700 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="p-8 pt-4">
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 hover:bg-transparent text-white text-[10px] uppercase font-black tracking-widest">
                                    <th className="h-14 px-4 text-left font-black">Order ID</th>
                                    <th className="h-14 px-4 text-left font-black">Customer</th>
                                    <th className="h-14 px-4 text-left font-black">Total</th>
                                    <th className="h-14 px-4 text-left font-black">Status</th>
                                    <th className="h-14 px-4 text-left font-black">Supplier / Logistics</th>
                                    <th className="h-14 px-4 text-left font-black">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="h-32 text-center text-white font-black italic uppercase">
                                            No orders pending dispatch.
                                        </td>
                                    </tr>
                                ) : (
                                    orders?.map((order) => (
                                        <tr key={order._id} className="border-b border-zinc-800 transition-all hover:bg-zinc-800 group">
                                            <td className="p-4 font-mono text-xs text-primary font-black">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black uppercase text-sm">{order.customerName}</span>
                                                    <span className="text-[10px] text-zinc-300 font-medium">{order.customerPhone}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-black text-white text-lg tracking-tighter">
                                                KSh {Math.floor(order.totalAmount).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                                                    order.status === "dispatched" ? "bg-green-500 text-black font-bold" : "bg-zinc-800 text-white border border-zinc-700"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {order.supplier ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-primary">
                                                            <Truck className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-white">{order.supplier.name}</span>
                                                            <span className="text-[8px] text-zinc-300 font-medium">{order.supplier.contactPhone}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-500 font-black italic uppercase">Awaiting Fulfillment</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <DispatchAction
                                                    order={order}
                                                    vendorId={vendor._id}
                                                    suppliers={suppliers || []}
                                                    vendorPhone={currentUser.phone || "0700000000"}
                                                />
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

function DispatchAction({ order, vendorId, suppliers, vendorPhone }: { order: any, vendorId: any, suppliers: any[], vendorPhone: string }) {
    const executeDispatch = useAction(api.notifications.executeSupplierDispatch);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { alert } = useNexusDialog();
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [address, setAddress] = useState("");

    const isDispatched = order.status === "dispatched";

    const handleSupplierDispatch = async () => {
        if (!selectedSupplier || !address) return;
        setLoading(true);

        const supplier = suppliers.find(s => s._id === selectedSupplier);
        if (!supplier) return;

        try {
            const result: any = await executeDispatch({
                orderId: order._id,
                supplierId: supplier._id,
                vendorId: vendorId,
                customerPhone: order.customerPhone,
                vendorPhone: vendorPhone,
                supplierPhone: supplier.contactPhone || "0711223344",
                dropoffAddress: address,
            });

            if (result.sms?.success) {
                await alert("Order Dispatched", "Success: Order Logged & SMS Sent via Africa's Talking.");
                setIsOpen(false);
            } else {
                await alert("Dispatch Notice", `Order Logged, but SMS failed: ${result.sms?.error || "Check AT Dashboard"}`);
            }
        } catch (error) {
            console.error(error);
            await alert("Dispatch Error", "Critical Error connecting to dispatch service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "w-full flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 group-hover:scale-[1.05]",
                        isDispatched ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-zinc-700 text-white hover:bg-primary hover:text-black border border-zinc-600"
                    )}
                >
                    <Truck className="w-4 h-4 mr-2" />
                    {isDispatched ? "Resend Alert" : "Dispatch"}
                </button>
                {isDispatched && (
                    <div className="flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Logged</span>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 p-10 shadow-2xl rounded-[48px] text-white">
                        <div className="space-y-4 mb-10">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-primary mb-6">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none text-white">Execute <span className="text-primary italic">Dispatch</span></h2>
                            <p className="text-sm text-white font-medium">
                                Assign <span className="text-white font-bold">Order #{order._id.slice(-6).toUpperCase()}</span> to a fulfillment partner and specify the delivery destination.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-8 top-8 text-white hover:scale-110 transition-transform"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fulfillment Partner</label>
                                <select
                                    className="w-full h-14 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none text-white cursor-pointer"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="" disabled className="bg-zinc-900">Select Participant</option>
                                    {suppliers?.map(s => (
                                        <option key={s._id} value={s._id} className="bg-zinc-900">
                                            {s.name} - {s.category} ({s.contactPhone})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Dropoff Point (Location)</label>
                                <input
                                    placeholder="e.g. Westlands, Nairobi"
                                    className="w-full h-14 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-zinc-600"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-14 rounded-2xl bg-zinc-800 border border-zinc-700 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSupplierDispatch}
                                disabled={loading || !selectedSupplier || !address}
                                className="h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4 fill-white group-hover:fill-black" />}
                                Initialize SMS Blast
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
