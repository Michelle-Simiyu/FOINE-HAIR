"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Gem } from "lucide-react";
import CurrencyToggle from "@/components/ui/CurrencyToggle";

export default function SiteHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-gold-800/20 bg-obsidian/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Gem size={16} className="text-gold-500 group-hover:text-gold-400 transition-colors" />
          <span className="text-ivory font-bold tracking-[0.25em] uppercase text-sm">
            Foine Hair
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {[
            { href: "/#gallery",       label: "Collection" },
            { href: "/configurator",   label: "Build"       },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-ivory/50 hover:text-gold-400 text-xs tracking-widest uppercase transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <CurrencyToggle />

          <button
            onClick={() => router.push("/configurator")}
            className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:block text-xs tracking-widest uppercase">Configure</span>
          </button>
        </div>
      </div>
    </header>
  );
}
