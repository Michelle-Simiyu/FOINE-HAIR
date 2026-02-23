import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

const geistSans = localFont({
  src:      "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight:   "100 900",
});

const geistMono = localFont({
  src:      "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight:   "100 900",
});

export const metadata: Metadata = {
  title:       "FOINE HAIR — Bespoke Luxury Wigs, Nairobi",
  description: "Design your custom wig from scratch. Real-time visual rendering, M-Pesa payments, and Nairobi delivery.",
  keywords:    ["luxury wigs", "custom wigs", "Nairobi wigs", "HD lace", "raw hair"],
  openGraph: {
    title:       "FOINE HAIR — Bespoke Luxury Wigs",
    description: "Build your perfect wig, piece by piece.",
    type:        "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-obsidian text-ivory`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
