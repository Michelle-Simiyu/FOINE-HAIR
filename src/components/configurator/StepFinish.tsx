"use client";

import { useWigStore } from "@/store/useWigStore";
import type { ScalpMapping, PackagingType, PaymentMethod } from "@/types/wig";
import { Smartphone, CreditCard, Shield, Sparkles, Package, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

const SCALP_OPTIONS: { value: ScalpMapping; label: string; sublabel: string; price?: number }[] = [
  { value: "None",             label: "Standard Fit",     sublabel: "Universal cap sizing",                  price: 0  },
  { value: "3D Scalp Mapping", label: "3D Scalp Mapping", sublabel: "Precision fit to your unique scalp",  price: 25 },
];

const PACKAGING_OPTIONS: { value: PackagingType; label: string; sublabel: string; price?: number }[] = [
  { value: "Standard",        label: "Standard",         sublabel: "Premium cloth bag + certificate",  price: 0  },
  { value: "Luxury Gift Box", label: "Luxury Gift Box",  sublabel: "Silk-lined box + ribbon seal",     price: 20 },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; sublabel: string; Icon: LucideIcon }[] = [
  { value: "mpesa",   label: "M-Pesa",   sublabel: "Lipa Na M-Pesa STK Push",       Icon: Smartphone  },
  { value: "stripe",  label: "Card",     sublabel: "Visa / Mastercard / Amex",       Icon: CreditCard  },
];

export default function StepFinish() {
  const config       = useWigStore(s => s.config);
  const updateConfig = useWigStore(s => s.updateConfig);

  return (
    <div className="py-6 px-4 sm:px-6 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-wider text-ivory">Finish</h2>
        <p className="text-ivory/40 text-sm mt-1">
          Final touches — technology, packaging, and payment preference.
        </p>
      </div>

      {/* 3D Scalp Mapping */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">
          Scalp Technology
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCALP_OPTIONS.map(opt => {
            const selected = config.scalpMapping === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateConfig({ scalpMapping: opt.value })}
                className={clsx(
                  "flex items-center gap-4 p-4 border text-left transition-all duration-200",
                  selected
                    ? "border-gold-500 bg-gold-950/50"
                    : "border-gold-800/30 bg-white/[0.03] hover:border-gold-700/60"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 flex items-center justify-center flex-shrink-0",
                  selected ? "text-gold-400" : "text-ivory/20"
                )}>
                  {opt.value === "3D Scalp Mapping"
                    ? <Sparkles size={22} />
                    : <Shield size={22} />
                  }
                </div>
                <div>
                  <p className={clsx("text-sm font-medium", selected ? "text-gold-300" : "text-ivory/80")}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-ivory/40 mt-0.5">{opt.sublabel}</p>
                  {(opt.price ?? 0) > 0 && (
                    <p className={clsx("text-[10px] font-semibold mt-1", selected ? "text-gold-400" : "text-ivory/30")}>
                      +${opt.price}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Packaging */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">
          Packaging
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PACKAGING_OPTIONS.map(opt => {
            const selected = config.packaging === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateConfig({ packaging: opt.value })}
                className={clsx(
                  "flex items-center gap-4 p-4 border text-left transition-all duration-200",
                  selected
                    ? "border-gold-500 bg-gold-950/50"
                    : "border-gold-800/30 bg-white/[0.03] hover:border-gold-700/60"
                )}
              >
                <Package size={22} className={selected ? "text-gold-400" : "text-ivory/20"} />
                <div>
                  <p className={clsx("text-sm font-medium", selected ? "text-gold-300" : "text-ivory/80")}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-ivory/40 mt-0.5">{opt.sublabel}</p>
                  {(opt.price ?? 0) > 0 && (
                    <p className={clsx("text-[10px] font-semibold mt-1", selected ? "text-gold-400" : "text-ivory/30")}>
                      +${opt.price}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Payment preference */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">
          Payment Method
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_OPTIONS.map(({ value, label, sublabel, Icon }) => {
            const selected = config.paymentMethod === value;
            return (
              <button
                key={value}
                onClick={() => updateConfig({ paymentMethod: value })}
                className={clsx(
                  "flex flex-col items-center gap-3 p-4 border transition-all duration-200",
                  selected
                    ? "border-gold-500 bg-gold-950/50"
                    : "border-gold-800/30 bg-white/[0.03] hover:border-gold-700/60"
                )}
              >
                <Icon size={24} />
                <div className="text-center">
                  <p className={clsx("text-sm font-medium", selected ? "text-gold-300" : "text-ivory/70")}>
                    {label}
                  </p>
                  <p className="text-[10px] text-ivory/30 mt-0.5">{sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
