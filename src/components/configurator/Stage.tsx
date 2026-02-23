"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWigStore } from "@/store/useWigStore";
import { getWigImageUrl } from "@/utils/cloudinaryHelper";
import { formatUSD } from "@/utils/priceCalculator";

// ─── Stage Props ──────────────────────────────────────────────────────────────
interface StageProps {
  className?: string;
}

// ─── Layer crossfade duration ──────────────────────────────────────────────────
const TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

export default function Stage({ className = "" }: StageProps) {
  const config         = useWigStore(s => s.config);
  const priceBreakdown = useWigStore(s => s.priceBreakdown);

  // Track current + previous image URL for crossfade
  const [displayedUrl, setDisplayedUrl] = useState<string>("");
  const [isLoading,    setIsLoading]    = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const url = getWigImageUrl(config);
    // Small delay to let the out-animation complete
    const t = setTimeout(() => {
      setDisplayedUrl(url);
      setIsLoading(false);
    }, 80);
    return () => clearTimeout(t);
  }, [config]);

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* ── Image Viewer ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden bg-[#0d0d0d]">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={   { opacity: 0 }}
            transition={TRANSITION}
            className="absolute inset-0"
          >
            {displayedUrl && (
              <Image
                src={displayedUrl}
                alt={`${config.texture} wig — ${config.length}" ${config.color}`}
                fill
                className="object-cover object-top"
                priority
                unoptimized={displayedUrl.startsWith("data:")}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Loading shimmer overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-shimmer-gradient animate-shimmer pointer-events-none" />
        )}

        {/* Floating spec badges */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
          <SpecBadge label={`${config.length}"`}      sublabel="Length" />
          <SpecBadge label={`${config.density}%`}     sublabel="Density" />
          <SpecBadge label={config.texture}            sublabel="Texture" />
          <SpecBadge label={config.laceType}           sublabel="Lace" />
        </div>

        {/* Top-right price pill */}
        <div className="absolute top-4 right-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={priceBreakdown.total}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y:  8 }}
              transition={{ duration: 0.25 }}
              className="bg-obsidian/80 border border-gold-700/60 backdrop-blur-sm
                         px-4 py-2 text-gold-400 font-semibold tracking-wider text-sm"
            >
              {formatUSD(priceBreakdown.total)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Color/Origin info bar ──────────────────────────────────────────── */}
      <div className="border-t border-gold-800/30 bg-obsidian/50 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between text-xs tracking-widest uppercase">
          <span className="text-gold-600">{config.origin} Hair</span>
          <span className="text-ivory/60">{config.color}</span>
          <span className="text-gold-600">{config.laceTint} Tint</span>
        </div>
      </div>
    </div>
  );
}

// ─── Spec Badge ───────────────────────────────────────────────────────────────
function SpecBadge({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-obsidian/80 border border-gold-800/40 backdrop-blur-sm px-3 py-1"
    >
      <p className="text-ivory text-xs font-medium leading-tight">{label}</p>
      <p className="text-gold-600 text-[10px] uppercase tracking-widest">{sublabel}</p>
    </motion.div>
  );
}
