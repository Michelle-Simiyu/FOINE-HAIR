"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PriceBreakdown } from "@/types/wig";
import { formatUSD, formatKES, USD_TO_KES } from "@/utils/priceCalculator";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Currency = "USD" | "KES";

interface CurrencyStore {
  currency:        Currency;

  // Actions
  toggleCurrency:  () => void;
  setCurrency:     (c: Currency) => void;

  // Format helpers — use these everywhere prices are displayed
  formatPrice:     (breakdown: PriceBreakdown) => string;    // total only
  formatAmount:    (usd: number) => string;                  // arbitrary USD amount
  secondaryPrice:  (breakdown: PriceBreakdown) => string;    // the "other" currency label
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "USD",

      toggleCurrency: () =>
        set(s => ({ currency: s.currency === "USD" ? "KES" : "USD" })),

      setCurrency: (c) => set({ currency: c }),

      formatPrice: (breakdown) => {
        const { currency } = get();
        return currency === "USD"
          ? formatUSD(breakdown.total)
          : formatKES(breakdown.totalKES);
      },

      formatAmount: (usd) => {
        const { currency } = get();
        if (currency === "USD") return formatUSD(usd);
        return formatKES(Math.round(usd * USD_TO_KES));
      },

      secondaryPrice: (breakdown) => {
        const { currency } = get();
        return currency === "USD"
          ? formatKES(breakdown.totalKES)
          : formatUSD(breakdown.total);
      },
    }),
    {
      name: "foine-currency",
    }
  )
);
