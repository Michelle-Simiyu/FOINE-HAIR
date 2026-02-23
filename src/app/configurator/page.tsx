"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWigStore } from "@/store/useWigStore";
import Navigation   from "@/components/configurator/Navigation";
import Stage        from "@/components/configurator/Stage";
import SummaryBar   from "@/components/configurator/SummaryBar";
import StepFoundation from "@/components/configurator/StepFoundation";
import StepDNA        from "@/components/configurator/StepDNA";
import StepArtistry   from "@/components/configurator/StepArtistry";
import StepFinish     from "@/components/configurator/StepFinish";

// ─── Step Panel Map ───────────────────────────────────────────────────────────
const PANELS = {
  foundation: StepFoundation,
  dna:        StepDNA,
  artistry:   StepArtistry,
  finish:     StepFinish,
};

const pageTransition = {
  initial:  { opacity: 0, x: 20 },
  animate:  { opacity: 1, x: 0  },
  exit:     { opacity: 0, x: -20 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

// ─── Configurator Page ────────────────────────────────────────────────────────
export default function ConfiguratorPage() {
  const currentStep = useWigStore(s => s.currentStep);
  const Panel       = PANELS[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Step Navigation */}
      <Navigation />

      {/* Main layout — Stage (left) + Config Panel (right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        {/* ── Visual Stage ──────────────────────────────────────────────────── */}
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)]">
          <Suspense fallback={<StageSkeleton />}>
            <Stage className="h-full" />
          </Suspense>
        </div>

        {/* ── Configuration Panel ───────────────────────────────────────────── */}
        <div className="flex flex-col min-h-0">
          {/* Scrollable options area */}
          <div className="flex-1 overflow-y-auto pb-2" style={{ maxHeight: "calc(100vh - 3.5rem - 80px)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                {...pageTransition}
              >
                <Suspense fallback={<PanelSkeleton />}>
                  <Panel />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fixed summary bar at bottom */}
          <SummaryBar />
        </div>
      </div>

      {/* Mobile Stage — shown below config panel on small screens */}
      <div className="lg:hidden order-first border-b border-gold-800/20">
        <div className="h-64 sm:h-80">
          <Stage className="h-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function StageSkeleton() {
  return (
    <div className="h-full bg-[#0d0d0d] animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-gold-700/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded" />
      ))}
    </div>
  );
}
