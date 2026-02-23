"use client";

import { useWigStore } from "@/store/useWigStore";
import OptionGroup from "./OptionGroup";
import type { HairLength, HairTexture, HairDensity, HairOrigin, HairColor } from "@/types/wig";
import { getMinDensityForLength } from "@/utils/validationRules";

// ─── Options ──────────────────────────────────────────────────────────────────
const LENGTHS: { value: HairLength; label: string; price?: number }[] = [
  { value: 10, label: '10"', price: 0  },
  { value: 12, label: '12"', price: 0  },
  { value: 14, label: '14"', price: 15 },
  { value: 16, label: '16"', price: 30 },
  { value: 18, label: '18"', price: 45 },
  { value: 20, label: '20"', price: 60 },
  { value: 22, label: '22"', price: 75 },
  { value: 24, label: '24"', price: 90 },
  { value: 26, label: '26"', price: 105 },
  { value: 28, label: '28"', price: 120 },
  { value: 30, label: '30"', price: 135 },
  { value: 32, label: '32"', price: 150 },
];

const TEXTURES: { value: HairTexture; label: string; sublabel: string }[] = [
  { value: "Straight",        label: "Straight",        sublabel: "Sleek & polished" },
  { value: "Body Wave",       label: "Body Wave",        sublabel: "Soft, flowing waves" },
  { value: "Loose Wave",      label: "Loose Wave",       sublabel: "Relaxed beach waves" },
  { value: "Deep Wave",       label: "Deep Wave",        sublabel: "Defined S-waves" },
  { value: "Kinky Straight",  label: "Kinky Straight",  sublabel: "Natural texture, straight" },
  { value: "4C Coily",        label: "4C Coily",         sublabel: "Tight coils, big volume" },
];

const DENSITIES: { value: HairDensity; label: string; sublabel: string; price?: number; badge?: string }[] = [
  { value: 130, label: "130%", sublabel: "Natural, light",        price: 0  },
  { value: 150, label: "150%", sublabel: "Standard fullness",      price: 0,   badge: "Base" },
  { value: 180, label: "180%", sublabel: "Full & voluminous",      price: 40  },
  { value: 200, label: "200%", sublabel: "Extra thick",            price: 70  },
  { value: 250, label: "250%", sublabel: "Maximum drama",          price: 110, badge: "Elite" },
];

const ORIGINS: { value: HairOrigin; label: string; sublabel: string; price?: number }[] = [
  { value: "Virgin",          label: "Virgin",         sublabel: "Grade 9A — chemically unprocessed", price: 0  },
  { value: "Raw Indian",      label: "Raw Indian",     sublabel: "Cuticle-aligned, silky",            price: 30 },
  { value: "Raw Cambodian",   label: "Raw Cambodian",  sublabel: "Thick, coarse, ultra-durable",      price: 45 },
  { value: "Raw Vietnamese",  label: "Raw Vietnamese", sublabel: "Fine, straight & super smooth",     price: 45 },
];

const COLORS: { value: HairColor; label: string }[] = [
  { value: "Natural Black",       label: "Natural Black"       },
  { value: "Off Black (1B)",      label: "Off Black (1B)"      },
  { value: "Dark Brown",          label: "Dark Brown"          },
  { value: "Medium Brown",        label: "Medium Brown"        },
  { value: "Honey Blonde",        label: "Honey Blonde"        },
  { value: "Platinum Blonde",     label: "Platinum Blonde"     },
  { value: "Burgundy",            label: "Burgundy"            },
  { value: "Ombre (1B/27)",       label: "Ombré 1B/27"         },
  { value: "Ombre (1B/Burgundy)", label: "Ombré 1B/Burgundy"   },
  { value: "Custom Color",        label: "Custom Color"        },
];

// ─── DNA Step ─────────────────────────────────────────────────────────────────
export default function StepDNA() {
  const config       = useWigStore(s => s.config);
  const updateConfig = useWigStore(s => s.updateConfig);

  const minDensity = getMinDensityForLength(config.length);

  return (
    <div className="py-6 px-4 sm:px-6 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-wider text-ivory">DNA</h2>
        <p className="text-ivory/40 text-sm mt-1">
          Define the hair specifications — the core of your wig.
        </p>
      </div>

      {/* Length */}
      <OptionGroup<HairLength>
        title="Length"
        description="+$15 per 2 inches above 12&quot;"
        options={LENGTHS}
        value={config.length}
        onChange={(v) => updateConfig({ length: v })}
        columns={4}
      />

      {/* Texture */}
      <OptionGroup<HairTexture>
        title="Texture"
        options={TEXTURES}
        value={config.texture}
        onChange={(v) => updateConfig({ texture: v })}
        columns={3}
      />

      {/* Density */}
      <div>
        {config.length >= 24 && (
          <p className="text-[10px] text-gold-600 tracking-wider uppercase mb-2">
            ⚡ Min. 180% density required for {config.length}&quot; length
          </p>
        )}
        <OptionGroup<HairDensity>
          title="Density"
          options={DENSITIES.map(d => ({
            ...d,
            disabled: d.value < minDensity,
            sublabel: d.value < minDensity
              ? `Unavailable for ${config.length}"`
              : d.sublabel,
          }))}
          value={config.density}
          onChange={(v) => updateConfig({ density: v })}
          columns={3}
        />
      </div>

      {/* Hair Origin */}
      <OptionGroup<HairOrigin>
        title="Hair Origin"
        options={ORIGINS}
        value={config.origin}
        onChange={(v) => updateConfig({ origin: v })}
        columns={2}
      />

      {/* Color */}
      <OptionGroup<HairColor>
        title="Color"
        options={COLORS}
        value={config.color}
        onChange={(v) => updateConfig({ color: v })}
        columns={3}
      />
    </div>
  );
}
