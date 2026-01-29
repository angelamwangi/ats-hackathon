"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { localDB } from "@/lib/sqlite/db";

export function useSync(vendorId?: string) {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [syncing, setSyncing] = useState(false);

    const remoteProducts = useQuery(api.products.getProducts, vendorId ? { vendorId: vendorId as any } : {});
    const createOrder = useMutation(api.orders.createOrder);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Sync Products from Convex to Local
    useEffect(() => {
        if (remoteProducts) {
            localDB.syncProducts(remoteProducts as any[]);
        }
    }, [remoteProducts]);

    // Sync Pending Orders from Local to Convex
    useEffect(() => {
        if (isOnline && !syncing) {
            const syncOrders = async () => {
                setSyncing(true);
                try {
                    const pendingOrders = await localDB.getPendingOrders();
                    if (pendingOrders.length === 0) return;

                    for (const order of pendingOrders) {
                        try {
                            // Skip orders with placeholder vendor IDs (created before fix)
                            if (order.vendorId === "placeholder-vendor-id" || !order.vendorId || typeof order.vendorId !== 'string' || !order.vendorId.startsWith('j')) {
                                console.warn(`Skipping invalid order ${order.id} with vendorId: ${order.vendorId}`);
                                // Mark as synced to remove from pending queue
                                await localDB.markAsSynced(order.id);
                                continue;
                            }

                            await createOrder({
                                vendorId: order.vendorId as any,
                                items: order.items as any,
                                totalAmount: order.totalAmount,
                                source: "pos",
                                offlineId: order.id,
                            });
                            await localDB.markAsSynced(order.id);
                        } catch (err) {
                            console.error(`Failed to sync order ${order.id}:`, err);
                        }
                    }
                } catch (error) {
                    console.error("Sync loop error:", error);
                } finally {
                    setSyncing(false);
                }
            };
            const interval = setInterval(syncOrders, 10000); // Check every 10s
            syncOrders();
            return () => clearInterval(interval);
        }
    }, [isOnline, createOrder, syncing]);

    return { isOnline, syncing };
}
