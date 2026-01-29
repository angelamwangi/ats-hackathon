"use client";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white py-32 px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">TERMS OF SERVICE</h1>
                <div className="space-y-8 text-white leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-white uppercase mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing Retail Nexus, you agree to be bound by these terms. Our "Save-to-Buy" (BNPL) model is subject to specific local financial regulations.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white uppercase mb-4">2. The "Save-to-Buy" Model</h2>
                        <p>Users enter into a non-debt progressive payment plan. 95% of payments are refundable upon cancellation, with a 5% platform maintenance fee retained.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white uppercase mb-4">3. Vendor Obligations</h2>
                        <p>Vendors must maintain accurate stock levels and honor all fully-funded "Save-to-Buy" acquisitions within the agreed fulfillment window.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}

