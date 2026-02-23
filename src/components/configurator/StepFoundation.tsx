"use client";

import { useWigStore } from "@/store/useWigStore";
import OptionGroup from "./OptionGroup";
import type {
  CapSize, LaceType, LaceTint, SecurityOption,
} from "@/types/wig";

// ─── Cap Sizes ────────────────────────────────────────────────────────────────
const CAP_SIZES: { value: CapSize; label: string; sublabel: string }[] = [
  { value: "Petite",  label: "Petite",  sublabel: "< 21.5\" circumference" },
  { value: "Average", label: "Average", sublabel: "21.5\" – 22.5\"" },
  { value: "Large",   label: "Large",   sublabel: "> 22.5\" circumference" },
];

// ─── Lace Types ───────────────────────────────────────────────────────────────
const LACE_TYPES: { value: LaceType; label: string; sublabel: string; price?: number; badge?: string }[] = [
  { value: "Transparent Lace", label: "Transparent Lace", sublabel: "Classic, all-skin melting",  price: 0 },
  { value: "HD Lace",          label: "HD Lace",          sublabel: "Ultra-thin, near-invisible", price: 55, badge: "Best Seller" },
  { value: "Silk Base",        label: "Silk Base",         sublabel: "Most natural scalp illusion", price: 95, badge: "Premium" },
];

// ─── Lace Tints (Melanin-Matched) ─────────────────────────────────────────────
const LACE_TINTS: { value: LaceTint; label: string; sublabel: string; hex: string }[] = [
  { value: "Porcelain", label: "Porcelain", sublabel: "Fair / Light beige", hex: "#ffdbc9" },
  { value: "Honey",     label: "Honey",     sublabel: "Light-medium",       hex: "#f5c5a3" },
  { value: "Caramel",   label: "Caramel",   sublabel: "Medium brown",       hex: "#c68642" },
  { value: "Espresso",  label: "Espresso",  sublabel: "Deep brown",         hex: "#7d4b2a" },
  { value: "Ebony",     label: "Ebony",     sublabel: "Rich dark",          hex: "#3b1f0e" },
];

// ─── Security Options ─────────────────────────────────────────────────────────
const SECURITY_OPTIONS: { value: SecurityOption; label: string; sublabel: string }[] = [
  { value: "Combs Only",                      label: "Combs Only",        sublabel: "Simple clip-in hold" },
  { value: "Combs + Straps",                  label: "Combs + Straps",    sublabel: "Recommended for daily wear" },
  { value: "Adjustable Elastic Piano Straps", label: "Piano Straps",      sublabel: "Required for Silk Base" },
];

// ─── Foundation Step ──────────────────────────────────────────────────────────
export default function StepFoundation() {
  const config       = useWigStore(s => s.config);
  const updateConfig = useWigStore(s => s.updateConfig);

  return (
    <div className="py-6 px-4 sm:px-6 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-wider text-ivory">Foundation</h2>
        <p className="text-ivory/40 text-sm mt-1">
          Choose your cap, lace type, and melanin-matched tint.
        </p>
      </div>

      {/* Cap Size */}
      <OptionGroup<CapSize>
        title="Cap Size"
        description="Measure around your hairline at the widest point."
        options={CAP_SIZES}
        value={config.capSize}
        onChange={(v) => updateConfig({ capSize: v })}
        columns={3}
      />

      {/* Lace Type */}
      <OptionGroup<LaceType>
        title="Lace Type"
        options={LACE_TYPES}
        value={config.laceType}
        onChange={(v) => updateConfig({ laceType: v })}
        columns={3}
      />

      {/* Lace Tint */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">
          Lace Tint — Melanin Matched
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {LACE_TINTS.map(t => (
            <button
              key={t.value}
              onClick={() => updateConfig({ laceTint: t.value as LaceTint })}
              className={`relative flex flex-col items-center gap-2 p-2 border transition-all duration-200
                ${config.laceTint === t.value
                  ? "border-gold-500"
                  : "border-gold-800/30 hover:border-gold-700/60"
                }`}
            >
              {/* Swatch */}
              <div
                className="w-full aspect-square rounded-full border-2 transition-all"
                style={{
                  backgroundColor: t.hex,
                  borderColor: config.laceTint === t.value ? "#d4920e" : "transparent",
                }}
              />
              <span className={`text-[10px] text-center tracking-wide leading-tight
                ${config.laceTint === t.value ? "text-gold-400" : "text-ivory/40"}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Security */}
      <OptionGroup<SecurityOption>
        title="Security System"
        options={SECURITY_OPTIONS.map(s => ({
          ...s,
          disabled: config.laceType === "Silk Base" && s.value !== "Adjustable Elastic Piano Straps",
        }))}
        value={config.security}
        onChange={(v) => updateConfig({ security: v })}
        columns={3}
      />
    </div>
  );
}
