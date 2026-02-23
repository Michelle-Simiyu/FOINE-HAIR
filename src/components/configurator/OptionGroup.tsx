"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { clsx } from "clsx";

// ─── Option Definition ────────────────────────────────────────────────────────
export interface Option<T = string> {
  value:       T;
  label:       string;
  sublabel?:   string;
  price?:      number;      // price adder (+$X)
  disabled?:   boolean;
  badge?:      string;      // e.g. "Most Popular", "Premium"
}

interface OptionGroupProps<T = string> {
  title:        string;
  description?: string;
  options:      Option<T>[];
  value:        T;
  onChange:     (value: T) => void;
  layout?:      "grid" | "row";
  columns?:     2 | 3 | 4;
}

// ─── Container animation ──────────────────────────────────────────────────────
const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ─── OptionGroup ──────────────────────────────────────────────────────────────
export default function OptionGroup<T extends string | number>({
  title,
  description,
  options,
  value,
  onChange,
  layout  = "grid",
  columns = 3,
}: OptionGroupProps<T>) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500">
          {title}
        </h3>
        {description && (
          <p className="text-ivory/40 text-xs mt-0.5">{description}</p>
        )}
      </div>

      {/* Options grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={clsx(
          layout === "grid" ? `grid gap-2 ${colClass}` : "flex flex-wrap gap-2"
        )}
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <motion.button
              key={String(opt.value)}
              variants={item}
              onClick={() => !opt.disabled && onChange(opt.value)}
              disabled={opt.disabled}
              whileTap={{ scale: opt.disabled ? 1 : 0.97 }}
              className={clsx(
                "relative group text-left transition-all duration-200",
                "border px-3 py-3",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500",
                selected
                  ? "border-gold-500 bg-gold-950/50"
                  : "border-gold-800/30 bg-white/[0.03] hover:border-gold-700/60 hover:bg-white/[0.06]",
                opt.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Badge */}
              {opt.badge && (
                <span className="absolute -top-2 left-2 bg-gold-600 text-obsidian text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5">
                  {opt.badge}
                </span>
              )}

              {/* Selected check */}
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center"
                >
                  <Check size={10} strokeWidth={3} className="text-obsidian" />
                </motion.div>
              )}

              {/* Label */}
              <p className={clsx(
                "text-sm font-medium leading-tight pr-5",
                selected ? "text-gold-300" : "text-ivory/80"
              )}>
                {opt.label}
              </p>

              {/* Sublabel */}
              {opt.sublabel && (
                <p className="text-[10px] text-ivory/40 mt-0.5 leading-tight">
                  {opt.sublabel}
                </p>
              )}

              {/* Price adder */}
              {opt.price !== undefined && opt.price > 0 && (
                <p className={clsx(
                  "text-[10px] font-semibold mt-1.5 tracking-wider",
                  selected ? "text-gold-400" : "text-ivory/30 group-hover:text-gold-700"
                )}>
                  +${opt.price}
                </p>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
