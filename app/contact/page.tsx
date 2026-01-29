"use client";

import { Mail, MessageCircle, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white py-32 px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">CONTACT <span className="text-primary italic">NEXUS</span></h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
                        <Mail className="w-8 h-8 text-primary mb-6" />
                        <h3 className="font-bold mb-2">Support Email</h3>
                        <p className="text-xs text-white/40">support@retailnexus.io</p>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
                        <MessageCircle className="w-8 h-8 text-primary mb-6" />
                        <h3 className="font-bold mb-2">WhatsApp</h3>
                        <p className="text-xs text-white/40">+1 (555) 0123 4567</p>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
                        <MapPin className="w-8 h-8 text-primary mb-6" />
                        <h3 className="font-bold mb-2">Nexus Hub</h3>
                        <p className="text-xs text-white/40">Global Distributed Network</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
