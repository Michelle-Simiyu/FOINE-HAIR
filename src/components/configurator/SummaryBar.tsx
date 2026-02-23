"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWigStore } from "@/store/useWigStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatUSD, formatKES, USD_TO_KES } from "@/utils/priceCalculator";
import { ChevronRight, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedPrice({ usd, kes }: { usd: number; kes: number }) {
  const currency  = useCurrencyStore(s => s.currency);
  const displayed = currency === "USD" ? usd : kes;
  const formatted = currency === "USD" ? formatUSD(usd) : formatKES(kes);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${currency}-${displayed}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y:  10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block tabular-nums"
      >
        {formatted}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Price Line ───────────────────────────────────────────────────────────────
function PriceLine({ label, amount, highlight = false, bold = false }: {
  label:      string;
  amount:     number;   // always USD
  highlight?: boolean;
  bold?:      boolean;
}) {
  const currency  = useCurrencyStore(s => s.currency);
  const formatted = currency === "USD"
    ? formatUSD(amount)
    : formatKES(Math.round(amount * USD_TO_KES));

  if (amount === 0) return null;
  return (
    <div className={clsx("flex justify-between items-center py-1", bold && "border-t border-gold-800/30 mt-1 pt-2")}>
      <span className={clsx("text-xs tracking-wide", highlight ? "text-gold-400" : "text-ivory/50")}>
        {label}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${currency}-${amount}`}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{    opacity: 0, x: -6 }}
          transition={{ duration: 0.2 }}
          className={clsx("text-xs font-medium", highlight ? "text-gold-300" : "text-ivory/60")}
        >
          +{formatted}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Notification Toast ───────────────────────────────────────────────────────
function NotificationToasts() {
  const notifications      = useWigStore(s => s.notifications);
  const dismissNotification = useWigStore(s => s.dismissNotification);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{    opacity: 0, x: 40,  scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              "pointer-events-auto flex items-start gap-3 p-3 border backdrop-blur-sm",
              n.type === "warning" && "bg-obsidian/95 border-gold-600/60",
              n.type === "success" && "bg-obsidian/95 border-green-600/60",
              n.type === "error"   && "bg-obsidian/95 border-red-600/60",
              n.type === "info"    && "bg-obsidian/95 border-blue-600/60",
            )}
          >
            <p className="text-ivory/80 text-xs leading-relaxed flex-1">{n.message}</p>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-ivory/30 hover:text-ivory/70 transition-colors mt-0.5 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────
export default function SummaryBar() {
  const priceBreakdown  = useWigStore(s => s.priceBreakdown);
  const currentStep     = useWigStore(s => s.currentStep);
  const nextStep        = useWigStore(s => s.nextStep);
  const secondaryPrice  = useCurrencyStore(s => s.secondaryPrice);
  const router          = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isLastStep = currentStep === "finish";

  function handleCTA() {
    if (isLastStep) {
      router.push("/checkout");
    } else {
      nextStep();
    }
  }

  return (
    <>
      <NotificationToasts />

      <div className="border-t border-gold-800/30 bg-obsidian/95 backdrop-blur-md">
        {/* Breakdown (expandable) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-b border-gold-800/20"
            >
              <div className="px-6 py-4 max-w-2xl">
                <PriceLine label={'Base Wig (12", 150%, Virgin)'}   amount={priceBreakdown.base}      highlight />
                <PriceLine label="Length Upgrade"                   amount={priceBreakdown.length} />
                <PriceLine label="Density Upgrade"                  amount={priceBreakdown.density} />
                <PriceLine label="Lace Upgrade"                     amount={priceBreakdown.lace} />
                <PriceLine label="Artistry & Origin"                amount={priceBreakdown.artistry} />
                <PriceLine label="Technology"                        amount={priceBreakdown.tech} />
                <PriceLine label="Packaging"                         amount={priceBreakdown.packaging} />
                <PriceLine label="Shipping"                          amount={priceBreakdown.shipping} />
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gold-800/30">
                  <span className="text-xs text-ivory/60 tracking-widest uppercase">Total</span>
                  <div className="text-right">
                    <p className="text-gold-400 font-bold text-base">
                      <AnimatedPrice usd={priceBreakdown.total} kes={priceBreakdown.totalKES} />
                    </p>
                    <p className="text-ivory/40 text-[10px]">{secondaryPrice(priceBreakdown)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
          {/* Price display */}
          <div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-left group"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-gold-400 font-bold text-xl sm:text-2xl">
                  <AnimatedPrice usd={priceBreakdown.total} kes={priceBreakdown.totalKES} />
                </span>
                <span className="text-ivory/30 text-xs">
                  / {secondaryPrice(priceBreakdown)}
                </span>
              </div>
              <p className="text-[10px] text-ivory/30 tracking-widest uppercase group-hover:text-gold-600 transition-colors">
                {expanded ? "Hide breakdown" : "View breakdown"}
              </p>
            </button>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleCTA}
            whileTap={{ scale: 0.97 }}
            className="btn-gold flex-shrink-0 text-sm tracking-widest"
          >
            {isLastStep ? (
              <>
                <ShoppingBag size={16} />
                Proceed to Checkout
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
