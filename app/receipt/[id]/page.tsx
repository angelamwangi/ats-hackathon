"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ReceiptPage() {
    const params = useParams();
    const orderId = params.id as string;

    // Using existing getOrder query
    const order = useQuery(api.orders.getOrder, { orderId: orderId as any });

    if (order === undefined) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (order === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
                Receipt not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="rounded-lg border bg-card text-card-foreground shadow-lg border-t-4 border-t-primary bg-white">
                    <div className="flex flex-col space-y-1.5 p-6 text-center pb-2">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold leading-none tracking-tight">Receipt</h3>
                        <p className="text-sm text-muted-foreground">
                            Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order._creationTime).toLocaleString()}
                        </p>
                    </div>

                    <div className="p-6 pt-0 space-y-6">
                        <div className="shrink-0 bg-border h-[1px] w-full bg-gray-200" />

                        <div className="space-y-4">
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-start text-sm">
                                    <div className="flex gap-3">
                                        <span className="font-bold w-6 text-muted-foreground">
                                            {item.quantity}x
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {item.product?.name || "Unknown Product"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                KSh {Math.floor(item.priceAtSale)}/ea
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-medium">
                                        KSh {Math.floor(item.quantity * item.priceAtSale).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="shrink-0 bg-border h-[1px] w-full bg-gray-200" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>KSh {Math.floor(order.totalAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Taxes</span>
                                <span>KSh 0</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                                <span>Total</span>
                                <span className="text-primary">KSh {Math.floor(order.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center p-6 pt-0 flex-col gap-4 text-center text-sm text-muted-foreground bg-gray-50/50 rounded-b-xl border-t">
                        <p>Thank you for shopping with us!</p>
                        <div className="text-xs mt-2">
                            Retail Nexus
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
