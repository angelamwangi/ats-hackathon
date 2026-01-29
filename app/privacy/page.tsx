"use client";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white py-32 px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">PRIVACY POLICY</h1>
                <div className="space-y-8 text-white leading-relaxed">
                    <p>Your privacy is paramount in the Retail Nexus ecosystem. We use enterprise-grade encryption for all transaction data.</p>
                    <section>
                        <h2 className="text-xl font-black text-white uppercase mb-4">Data Collection</h2>
                        <p>We collect minimal data necessary for KYC (Know Your Customer) verification and order fulfillment. We never sell your personal purchase patterns to third-party advertisers.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black text-white uppercase mb-4">Offline Data</h2>
                        <p>POS data stored locally in SQLite remains encrypted and is only transmitted to our secure Convex servers upon synchronization.</p>
                    </section>
                </div>
            </div>
        </main>
    );
}

