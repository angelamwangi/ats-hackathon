"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, User, Phone } from "lucide-react";

export default function TrackingPage() {
    const params = useParams();
    const orderId = params.id as string;

    // Use getDelivery query which returns status + rider info
    const delivery = useQuery(api.logistics.getDelivery, { orderId: orderId as any });

    if (delivery === undefined) return <LoadingScreen />;
    if (delivery === null) return <NotFoundScreen />;

    const steps = [
        { id: 'pending', label: 'Looking for Rider' },
        { id: 'assigned', label: 'Rider Assigned' },
        { id: 'picked_up', label: 'Picked Up' },
        { id: 'in_transit', label: 'On The Way' },
        { id: 'delivered', label: 'Delivered' }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === delivery.status) === -1
        ? (delivery.status === 'cancelled' ? -1 : 0) // Default to pending if unknown or early
        : steps.findIndex(s => s.id === delivery.status);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Map Area (Mobile: 50vh, Desktop: Full) */}
            <div className="w-full h-[50vh] md:h-screen md:w-2/3 bg-gray-200 relative overflow-hidden">
                {/* Simulated Map */}
                <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/map/map-background.jpg')] bg-cover opacity-10 flex items-center justify-center">
                    <p className="text-gray-400 font-bold text-2xl">MAP VIEW</p>
                </div>

                {/* Rider Marker (Simulated Position) */}
                {delivery.rider && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-12 h-12 bg-black rounded-full shadow-xl border-4 border-white flex items-center justify-center relative z-10">
                            <User className="text-white w-6 h-6" />
                        </div>
                        <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold whitespace-nowrap">
                            {/* Mock arrival time based on distance/status */}
                            {delivery.status === 'in_transit' ? 'Arriving in 5 min' : 'Waiting...'}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar / Bottom Sheet */}
            <div className="w-full md:w-1/3 bg-white p-6 shadow-2xl z-20 flex flex-col h-[50vh] md:h-screen overflow-y-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-black tracking-tight mb-2">Order Tracking</h1>
                    <p className="text-muted-foreground text-sm">Order #{delivery.orderId.slice(-6).toUpperCase()}</p>
                </div>

                <div className="space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />

                    {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                            <div key={step.id} className="relative flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-colors ${isCompleted ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-transparent'
                                    }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-xs text-primary font-bold animate-pulse">
                                            Processing...
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {delivery.rider && (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-8 bg-gray-50 border-gray-200">
                        <div className="flex flex-col space-y-1.5 p-6 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="text-gray-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold leading-none tracking-tight text-sm">{delivery.rider.name}</h3>
                                    <p className="text-sm text-muted-foreground text-xs">Your Courier</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg cursor-pointer">
                                    <Phone className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
}

function NotFoundScreen() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">
            Tracking info not found
        </div>
    );
}
