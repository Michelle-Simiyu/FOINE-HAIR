"use client";

import { useWigStore } from "@/store/useWigStore";
import OptionGroup from "./OptionGroup";
import type { KnotBleaching, HairlineStyle, BabyHairStyle, ScentOption } from "@/types/wig";

const KNOTS: { value: KnotBleaching; label: string; sublabel: string; price?: number }[] = [
  { value: "None",            label: "None",            sublabel: "Unbleached knots",               price: 0  },
  { value: "Bleached Knots",  label: "Bleached Knots",  sublabel: "Invisible knots at hairline",    price: 15 },
  { value: "Pre-Bleached HD", label: "Pre-Bleached HD", sublabel: "Max-invisible for HD/Silk lace", price: 25 },
];

const HAIRLINES: { value: HairlineStyle; label: string; sublabel: string; price?: number }[] = [
  { value: "Natural Sparse",     label: "Natural Sparse",      sublabel: "Unaltered, full",              price: 0  },
  { value: "Pre-Plucked",        label: "Pre-Plucked",         sublabel: "Realistic recession",          price: 15 },
  { value: "Extra Pre-Plucked",  label: "Extra Pre-Plucked",   sublabel: "Ultra-natural widow's peak",   price: 25 },
];

const BABY_HAIRS: { value: BabyHairStyle; label: string; sublabel: string; price?: number }[] = [
  { value: "None",           label: "None",           sublabel: "Clean hairline",      price: 0  },
  { value: "Minimal",        label: "Minimal",        sublabel: "Soft, wispy edges",  price: 0  },
  { value: "Defined Edges",  label: "Defined Edges",  sublabel: "Laid & defined",      price: 12 },
];

const SCENTS: { value: ScentOption; label: string; sublabel: string; price?: number; badge?: string }[] = [
  { value: "None",             label: "None",           sublabel: "No added scent",           price: 0  },
  { value: "Unscented Premium", label: "Premium Unscented", sublabel: "Anti-odor treatment",   price: 10 },
  { value: "Rose Oud",         label: "Rose Oud",       sublabel: "Warm, luxury florals",     price: 10, badge: "Fav" },
  { value: "Vanilla Musk",     label: "Vanilla Musk",   sublabel: "Soft, sensual warmth",     price: 10 },
];

export default function StepArtistry() {
  const config       = useWigStore(s => s.config);
  const updateConfig = useWigStore(s => s.updateConfig);

  return (
    <div className="py-6 px-4 sm:px-6 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-wider text-ivory">Artistry</h2>
        <p className="text-ivory/40 text-sm mt-1">
          The handcrafted details that make it truly yours.
        </p>
      </div>

      <OptionGroup<KnotBleaching>
        title="Knot Bleaching"
        description="Bleached knots mimic natural hair growth from scalp."
        options={KNOTS}
        value={config.knotBleaching}
        onChange={(v) => updateConfig({ knotBleaching: v })}
        columns={3}
      />

      <OptionGroup<HairlineStyle>
        title="Hairline Customization"
        options={HAIRLINES}
        value={config.hairlineStyle}
        onChange={(v) => updateConfig({ hairlineStyle: v })}
        columns={3}
      />

      <OptionGroup<BabyHairStyle>
        title="Baby Hairs"
        options={BABY_HAIRS}
        value={config.babyHairs}
        onChange={(v) => updateConfig({ babyHairs: v })}
        columns={3}
      />

      <OptionGroup<ScentOption>
        title="Signature Scent"
        description="Infused during the final wash — fades naturally over 2–4 weeks."
        options={SCENTS}
        value={config.scent}
        onChange={(v) => updateConfig({ scent: v })}
        columns={2}
      />
    </div>
  );
}
