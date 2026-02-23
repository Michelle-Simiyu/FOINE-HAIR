"use client";

import { motion } from "framer-motion";
import { useCurrencyStore, type Currency } from "@/store/useCurrencyStore";

// ─── Options ──────────────────────────────────────────────────────────────────
const OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "KES", label: "KES" },
];

// ─── CurrencyToggle ───────────────────────────────────────────────────────────
export default function CurrencyToggle() {
  const currency    = useCurrencyStore(s => s.currency);
  const setCurrency = useCurrencyStore(s => s.setCurrency);

  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className="relative flex items-center bg-white/5 border border-gold-800/30 rounded-full p-0.5"
    >
      {OPTIONS.map(opt => {
        const isActive = currency === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => setCurrency(opt.value)}
            className="relative px-3 py-1 text-[11px] tracking-widest uppercase font-medium rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 transition-colors duration-200"
            style={{ color: isActive ? "#0a0a0a" : "#c0a060" }}
          >
            {/* Sliding gold pill */}
            {isActive && (
              <motion.span
                layoutId="currency-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-gold-500"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
