"use client";

import { motion } from "framer-motion";
import { useWigStore } from "@/store/useWigStore";
import type { ConfigStep } from "@/types/wig";
import {
  isFoundationComplete,
  isDnaComplete,
  isArtistryComplete,
} from "@/utils/validationRules";
import { Check } from "lucide-react";
import { clsx } from "clsx";

// ─── Step Definitions ─────────────────────────────────────────────────────────
const STEPS: { id: ConfigStep; label: string; sublabel: string; number: number }[] = [
  { id: "foundation", label: "Foundation", sublabel: "Cap · Lace · Tint",           number: 1 },
  { id: "dna",        label: "DNA",        sublabel: "Length · Texture · Density",  number: 2 },
  { id: "artistry",   label: "Artistry",   sublabel: "Knots · Hairline · Scent",    number: 3 },
  { id: "finish",     label: "Finish",     sublabel: "Tech · Packaging · Payment",  number: 4 },
];

export default function Navigation() {
  const currentStep = useWigStore(s => s.currentStep);
  const setStep     = useWigStore(s => s.setStep);
  const config      = useWigStore(s => s.config);

  function isComplete(id: ConfigStep): boolean {
    if (id === "foundation") return isFoundationComplete(config);
    if (id === "dna")        return isDnaComplete(config);
    if (id === "artistry")   return isArtistryComplete(config);
    return false;
  }

  function isAccessible(id: ConfigStep): boolean {
    const idx     = STEPS.findIndex(s => s.id === id);
    const current = STEPS.findIndex(s => s.id === currentStep);
    return idx <= current || isComplete(STEPS[idx - 1]?.id as ConfigStep);
  }

  return (
    <nav className="w-full border-b border-gold-800/30 bg-obsidian">
      <div className="max-w-7xl mx-auto px-4 py-0">
        <div className="flex items-stretch">
          {STEPS.map((step, idx) => {
            const active     = step.id === currentStep;
            const done       = isComplete(step.id);
            const accessible = isAccessible(step.id);

            return (
              <button
                key={step.id}
                onClick={() => accessible && setStep(step.id)}
                disabled={!accessible}
                className={clsx(
                  "relative flex-1 flex flex-col items-center py-4 px-2 transition-all duration-200",
                  "border-r border-gold-800/20 last:border-r-0",
                  accessible ? "cursor-pointer" : "cursor-not-allowed opacity-40",
                  active     ? "bg-gold-950/40" : "hover:bg-white/5"
                )}
              >
                {/* Active underline */}
                {active && (
                  <motion.div
                    layoutId="step-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Step number / check */}
                <div
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold",
                    "border transition-all duration-200",
                    done
                      ? "border-gold-500 bg-gold-500 text-obsidian"
                      : active
                        ? "border-gold-500 text-gold-400"
                        : "border-gold-800/60 text-ivory/40"
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : step.number}
                </div>

                {/* Labels */}
                <span
                  className={clsx(
                    "text-[11px] font-semibold tracking-widest uppercase transition-colors",
                    active ? "text-gold-400" : done ? "text-gold-600" : "text-ivory/40"
                  )}
                >
                  {step.label}
                </span>
                <span className="text-[9px] text-ivory/30 tracking-wider uppercase mt-0.5 hidden sm:block">
                  {step.sublabel}
                </span>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
