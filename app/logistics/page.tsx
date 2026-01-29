"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Navigation, User } from "lucide-react";
import Link from "next/link";

export default function RiderDashboard() {
    const { user } = useUser();

    // Check if user has 'logistics' role? 
    // Ideally we assume yes if they land here, or check DB. 
    // Skipping role check for hackathon speed, but listing deliveries.

    const nearbyDeliveries = useQuery(api.logistics.getAvailableDeliveries);
    const myDeliveries = useQuery(api.logistics.getMyDeliveries, user ? { riderId: user.id as any } : "skip"); // Use string ID?

    // Filter for active delivery
    const activeDelivery = myDeliveries?.find(d =>
        ['assigned', 'picked_up', 'in_transit'].includes(d.status)
    );

    if (!user || nearbyDeliveries === undefined) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-20">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rider App</h1>
                    <p className="text-white text-sm">Welcome back, {user.firstName}</p>
                </div>
                <Link href="/logistics/profile" className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 hover:bg-green-500/30 transition-colors">
                    <User className="w-5 h-5 text-green-500" />
                </Link>
            </header>

            {/* Active Delivery takes precedence */}
            {activeDelivery ? (
                <ActiveDeliveryView delivery={activeDelivery} userId={user.id} />
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Available Orders
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary text-black">
                            {nearbyDeliveries.length}
                        </span>
                    </h2>

                    {nearbyDeliveries.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                            <p className="text-white">No orders nearby.</p>
                        </div>
                    ) : (
                        nearbyDeliveries.map(d => (
                            <DeliveryCard key={d._id} delivery={d} userId={user.id} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function DeliveryCard({ delivery, userId }: { delivery: any, userId: string }) {
    const acceptDelivery = useMutation(api.logistics.acceptDelivery);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await acceptDelivery({ deliveryId: delivery._id, riderId: userId as any });
            alert("Delivery Accepted!");
        } catch (err) {
            console.error(err);
            alert("Failed to accept");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white/5 border-white/10">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight text-lg text-white">Delivery #{delivery._id.slice(-4)}</h3>
                        <p className="text-sm text-muted-foreground text-white">Includes {delivery.estimatedDuration} mins trip</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary/50 text-white">
                        ${delivery.cost} Earnings
                    </span>
                </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
                <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                        <div className="w-0.5 h-8 bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-white text-xs uppercase tracking-wider">Pickup</p>
                            <p className="text-white font-medium">{delivery.pickupLocation.address}</p>
                        </div>
                        <div>
                            <p className="text-white text-xs uppercase tracking-wider">Dropoff</p>
                            <p className="text-white font-medium">{delivery.dropoffLocation.address}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center p-6 pt-0">
                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 w-full bg-primary text-black font-bold h-12"
                    onClick={handleAccept}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Delivery"}
                </button>
            </div>
        </div>
    );
}

function ActiveDeliveryView({ delivery, userId }: { delivery: any, userId: string }) {
    const updateStatus = useMutation(api.logistics.updateDeliveryStatus);
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: "picked_up" | "in_transit" | "delivered") => {
        setLoading(true);
        // Simulate location update
        const mockLocation = {
            lat: delivery.dropoffLocation.lat - 0.001, // getting closer
            lng: delivery.dropoffLocation.lng - 0.001
        };

        try {
            await updateStatus({
                deliveryId: delivery._id,
                status: newStatus,
                location: mockLocation
            });
            alert(`Status updated to ${newStatus.replace("_", " ")}`);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-primary/10 border-primary/20">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold leading-none tracking-tight text-primary flex items-center gap-2">
                        <Navigation className="w-5 h-5 fill-current" />
                        Active Delivery
                    </h3>
                </div>
            </div>

            <div className="relative aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                {/* Mock Map */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/36.8219,-1.2921,13,0/600x400?access_token=...')] bg-cover bg-center opacity-50" />
                <p className="text-white text-sm relative z-10 font-mono">MAP VIEW SIMULATION</p>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)] animate-pulse" />
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-white font-bold mb-1">Customer</h3>
                    <p className="text-white text-sm">Dropoff: {delivery.dropoffLocation.address}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {delivery.status === 'assigned' && (
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-14 text-lg font-bold bg-white text-black hover:bg-white/90"
                            onClick={() => handleStatusUpdate('picked_up')}
                            disabled={loading}
                        >
                            Confirm Pickup
                        </button>
                    )}

                    {delivery.status === 'picked_up' && (
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-14 text-lg font-bold bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => handleStatusUpdate('in_transit')}
                            disabled={loading}
                        >
                            Start Journey
                        </button>
                    )}

                    {delivery.status === 'in_transit' && (
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-14 text-lg font-bold bg-green-500 text-white hover:bg-green-600"
                            onClick={() => handleStatusUpdate('delivered')}
                            disabled={loading}
                        >
                            Confirm Delivery
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
