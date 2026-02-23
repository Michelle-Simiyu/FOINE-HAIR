"use client";

import { useState, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWigStore } from "@/store/useWigStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import type { InspirationModel } from "@/types/wig";
import { ArrowRight, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";

// ─── Inspiration Models ───────────────────────────────────────────────────────
const MODELS: InspirationModel[] = [
  {
    id:        "nairobi-boss",
    name:      "The Nairobi Boss",
    tagline:   "Power. Confidence. Board-room ready.",
    image:     "/gallery/nairobi-boss.jpg",
    priceFrom: 220,
    preset: {
      length: 22, texture: "Straight", density: 180, laceType: "HD Lace",
      laceTint: "Caramel", color: "Natural Black", origin: "Raw Indian",
      hairlineStyle: "Pre-Plucked",
    },
  },
  {
    id:        "weekend-wave",
    name:      "The Weekend Wave",
    tagline:   "Effortless. Beachy. Turned heads.",
    image:     "/gallery/weekend-wave.jpg",
    priceFrom: 195,
    preset: {
      length: 18, texture: "Body Wave", density: 150, laceType: "Transparent Lace",
      laceTint: "Honey", color: "Ombre (1B/27)", origin: "Virgin",
    },
  },
  {
    id:        "silk-royale",
    name:      "The Silk Royale",
    tagline:   "Ultra-luxury. Invisible lace. Royalty-grade.",
    image:     "/gallery/silk-royale.jpg",
    priceFrom: 380,
    preset: {
      length: 26, texture: "Loose Wave", density: 200, laceType: "Silk Base",
      laceTint: "Espresso", color: "Off Black (1B)", origin: "Raw Cambodian",
      knotBleaching: "Pre-Bleached HD", hairlineStyle: "Extra Pre-Plucked", scent: "Rose Oud",
    },
  },
  {
    id:        "kink-queen",
    name:      "The Kink Queen",
    tagline:   "Afro-texture. Defined. Unapologetically you.",
    image:     "/gallery/kink-queen.jpg",
    priceFrom: 250,
    preset: {
      length: 16, texture: "4C Coily", density: 250, laceType: "HD Lace",
      laceTint: "Ebony", color: "Natural Black", origin: "Raw Indian",
      babyHairs: "Defined Edges",
    },
  },
  {
    id:        "golden-hour",
    name:      "The Golden Hour",
    tagline:   "Honey blonde. Warm light. Unforgettable.",
    image:     "/gallery/golden-hour.jpg",
    priceFrom: 265,
    preset: {
      length: 20, texture: "Deep Wave", density: 180, laceType: "HD Lace",
      laceTint: "Honey", color: "Honey Blonde", origin: "Raw Vietnamese",
    },
  },
  {
    id:        "deep-midnight",
    name:      "The Deep Midnight",
    tagline:   "Ombré. Mysterious. After-dark allure.",
    image:     "/gallery/deep-midnight.jpg",
    priceFrom: 235,
    preset: {
      length: 24, texture: "Body Wave", density: 180, laceType: "HD Lace",
      laceTint: "Espresso", color: "Ombre (1B/Burgundy)", origin: "Raw Indian",
    },
  },
];

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterKey = "All" | "Straight" | "Waves" | "Coily" | "Blonde";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "All",      label: "All Looks"   },
  { key: "Straight", label: "Straight"    },
  { key: "Waves",    label: "Waves"       },
  { key: "Coily",    label: "Coily"       },
  { key: "Blonde",   label: "Blonde"      },
];

function matchesFilter(model: InspirationModel, filter: FilterKey): boolean {
  if (filter === "All")      return true;
  if (filter === "Straight") return model.preset.texture === "Straight" || model.preset.texture === "Kinky Straight";
  if (filter === "Waves")    return ["Body Wave", "Loose Wave", "Deep Wave"].includes(model.preset.texture ?? "");
  if (filter === "Coily")    return model.preset.texture === "4C Coily";
  if (filter === "Blonde")   return String(model.preset.color ?? "").toLowerCase().includes("blonde");
  return true;
}

const PAGE_SIZE = 6;

// ─── Model Card ───────────────────────────────────────────────────────────────
function ModelCard({ model, index }: { model: InspirationModel; index: number }) {
  const router        = useRouter();
  const setPreset     = useWigStore(s => s.setPreset);
  const formatAmount  = useCurrencyStore(s => s.formatAmount);
  const priceLabel    = formatAmount(model.priceFrom);

  function handleCustomize() {
    setPreset(model.preset);
    router.push(`/configurator?model=${model.id}`);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden border border-gold-800/20 bg-white/[0.02] flex flex-col"
      aria-label={`${model.name} — from ${priceLabel}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111] flex-shrink-0">
        <Image
          src={model.image}
          alt={`${model.name} wig style`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/15 to-transparent" aria-hidden />

        {/* Price badge */}
        <div
          className="absolute top-4 right-4 bg-obsidian/85 border border-gold-700/40 backdrop-blur-sm px-3 py-1"
          aria-label={`Starting from ${priceLabel}`}
        >
          <span className="text-gold-400 text-xs font-semibold tracking-wider">
            From {priceLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-ivory font-semibold text-base tracking-wide mb-1">
          {model.name}
        </h3>
        <p className="text-ivory/40 text-xs leading-relaxed mb-4">
          {model.tagline}
        </p>

        {/* Spec chips */}
        <div
          className="flex flex-wrap gap-1.5 mb-5"
          aria-label="Style specifications"
        >
          {model.preset.length   && <Chip>{model.preset.length}&quot;</Chip>}
          {model.preset.texture  && <Chip>{model.preset.texture}</Chip>}
          {model.preset.density  && <Chip>{model.preset.density}%</Chip>}
          {model.preset.laceType && <Chip>{model.preset.laceType}</Chip>}
        </div>

        {/* CTA — pushed to bottom */}
        <div className="mt-auto">
          <motion.button
            onClick={handleCustomize}
            whileTap={{ scale: 0.97 }}
            className="w-full btn-gold text-xs tracking-[0.15em]"
            aria-label={`Customize ${model.name}`}
          >
            Customize This Look
            <ArrowRight size={14} aria-hidden />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-wider text-ivory/40 border border-gold-800/30 px-2 py-0.5">
      {children}
    </span>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export default function ProductGallery() {
  const router           = useRouter();
  const searchId         = useId();
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [page,   setPage]   = useState(1);

  // Filter + search
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MODELS.filter(m => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        (m.preset.texture ?? "").toLowerCase().includes(q) ||
        (m.preset.color   ?? "").toLowerCase().includes(q);
      return matchSearch && matchesFilter(m, filter);
    });
  }, [query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(key: FilterKey) {
    setFilter(key);
    setPage(1);
  }

  function handleSearch(q: string) {
    setQuery(q);
    setPage(1);
  }

  return (
    <section
      aria-labelledby="gallery-heading"
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="text-center mb-10 sm:mb-14">
        <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-3">
          Inspiration Collection
        </p>
        <h2
          id="gallery-heading"
          className="text-3xl sm:text-4xl font-semibold text-ivory tracking-wide mb-4"
        >
          Find Your Signature Look
        </h2>
        <p className="text-ivory/40 max-w-lg mx-auto text-sm leading-relaxed">
          Start with one of our curated styles, then make it entirely your own.
        </p>
        <div className="h-px w-20 bg-gold-600 mx-auto mt-6" aria-hidden />
      </div>

      {/* ── Search + Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <label htmlFor={searchId} className="sr-only">Search styles</label>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30 pointer-events-none"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search styles, textures..."
            className="w-full bg-white/5 border border-gold-800/30 text-ivory text-sm
                       placeholder-ivory/25 pl-9 pr-8 py-2.5
                       focus:outline-none focus:border-gold-500 transition-colors"
            aria-label="Search styles"
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/70 transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <nav aria-label="Style filters" className="flex gap-1 overflow-x-auto pb-0.5 flex-shrink-0">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              aria-pressed={filter === f.key}
              className={clsx(
                "flex-shrink-0 px-3 sm:px-4 py-2 text-[11px] tracking-widest uppercase border",
                "transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500",
                filter === f.key
                  ? "border-gold-500 text-gold-400 bg-gold-950/30"
                  : "border-gold-800/30 text-ivory/40 hover:border-gold-700/50 hover:text-ivory/60"
              )}
            >
              {f.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Results count ─────────────────────────────────────────────────── */}
      <p className="text-ivory/30 text-xs mb-5" aria-live="polite" aria-atomic>
        {filtered.length === 0
          ? "No styles match your search."
          : `${filtered.length} style${filtered.length !== 1 ? "s" : ""} found`}
        {query && ` for "${query}"`}
      </p>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {paginated.length > 0 ? (
          <motion.div
            key={`${filter}-${query}-${safePage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              role="list"
              aria-label="Style collection"
            >
              {paginated.map((model, i) => (
                <div key={model.id} role="listitem">
                  <ModelCard model={model} index={i} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-ivory/30 text-sm mb-3">No styles match your search.</p>
            <button
              onClick={() => { handleSearch(""); handleFilterChange("All"); }}
              className="text-gold-500 hover:text-gold-400 text-xs tracking-widest uppercase transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <nav
          aria-label="Gallery pagination"
          className="flex items-center justify-center gap-2 mt-10"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className={clsx(
              "w-9 h-9 flex items-center justify-center border transition-all",
              safePage === 1
                ? "border-gold-800/20 text-ivory/20 cursor-not-allowed"
                : "border-gold-700/40 text-gold-500 hover:border-gold-500"
            )}
          >
            <ChevronLeft size={15} aria-hidden />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={safePage === p ? "page" : undefined}
              className={clsx(
                "w-9 h-9 text-xs font-medium border transition-all",
                safePage === p
                  ? "border-gold-500 text-gold-400 bg-gold-950/30"
                  : "border-gold-800/30 text-ivory/40 hover:border-gold-700/50"
              )}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className={clsx(
              "w-9 h-9 flex items-center justify-center border transition-all",
              safePage === totalPages
                ? "border-gold-800/20 text-ivory/20 cursor-not-allowed"
                : "border-gold-700/40 text-gold-500 hover:border-gold-500"
            )}
          >
            <ChevronRight size={15} aria-hidden />
          </button>
        </nav>
      )}

      {/* ── Build from scratch CTA ────────────────────────────────────────── */}
      <div className="text-center mt-14">
        <p className="text-ivory/30 text-sm mb-4">Prefer to start with a blank canvas?</p>
        <button
          onClick={() => router.push("/configurator")}
          className="btn-ghost tracking-[0.15em] text-sm"
          aria-label="Build a custom wig from scratch"
        >
          Build From Scratch
          <ArrowRight size={15} aria-hidden />
        </button>
      </div>
    </section>
  );
}
