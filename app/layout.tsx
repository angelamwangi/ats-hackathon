import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { UserSync } from "@/components/providers/user-sync";
import { CSPostHogProvider } from "@/components/providers/posthog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retail Nexus | The Retail Operating System",
  description: "Retail Nexus is an all-in-one Retail Operating System bridging formal and informal commerce with offline-first POS and BNPL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="clerk-captcha" className="hidden" />
        <ConvexClientProvider>
          <CSPostHogProvider>
            <UserSync />
            {children}
          </CSPostHogProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

