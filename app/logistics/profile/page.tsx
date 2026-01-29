"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Loader2, Truck, User, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LogisticsProfilePage() {
    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const updateProfile = useMutation(api.users.updateLogisticsProfile);

    const [formData, setFormData] = useState({
        companyName: "",
        vehicleType: "bike",
        plateNumber: "",
        isAvailable: true
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                companyName: currentUser.companyName || "",
                vehicleType: currentUser.vehicleType || "bike",
                plateNumber: currentUser.plateNumber || "",
                isAvailable: currentUser.isAvailable ?? true
            });
        }
    }, [currentUser]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSaving(true);
        try {
            await updateProfile({
                userId: currentUser._id,
                ...formData
            });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-20">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/logistics" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-black uppercase tracking-tight">Rider Profile</h1>
            </header>

            <div className="max-w-md mx-auto space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-primary/50">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold">{currentUser.name}</h2>
                        <p className="text-sm text-white/60">{currentUser.email}</p>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">Logistics Partner</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-white/60 mb-2 block">Company / Team Name</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="e.g. Flash Courier Services"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-white/60 mb-2 block">Vehicle Type</label>
                        <select
                            value={formData.vehicleType}
                            onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        >
                            <option value="bike">Motorbike</option>
                            <option value="car">Car</option>
                            <option value="van">Van</option>
                            <option value="truck">Truck</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-white/60 mb-2 block">Plate Number</label>
                        <input
                            type="text"
                            value={formData.plateNumber}
                            onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                            placeholder="e.g. KCA 123X"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-sm font-bold">Accepting Orders</span>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                            className={cn(
                                "w-12 h-6 rounded-full relative transition-colors duration-300",
                                formData.isAvailable ? "bg-primary" : "bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                formData.isAvailable ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
