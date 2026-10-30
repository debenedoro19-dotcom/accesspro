import type { Metadata } from "next";
import { Inter, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ensureSeeded } from "@/db/seed";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb" });

export const metadata: Metadata = {
  title: {
    default: "AccessPro — Verified Trades. Premium Pay.",
    template: "%s · AccessPro",
  },
  description:
    "The premium marketplace for verified local tradespeople and homeowners. High-pay gigs, rigorous identity checks, and secure time-limited smart-lock access.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}