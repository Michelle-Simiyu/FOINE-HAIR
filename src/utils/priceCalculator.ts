import type { WigConfiguration, PriceBreakdown, ShippingZone } from "@/types/wig";
import { SHIPPING_RATES } from "./shippingRules";

// ─── Constants ────────────────────────────────────────────────────────────────
export const BASE_PRICE     = 150;   // USD — Standard 12", 150% density, Virgin Hair
export const BASE_LENGTH    = 12;    // inches
export const USD_TO_KES     = 135;   // static exchange rate

// ─── Length Surcharge ─────────────────────────────────────────────────────────
// +$15 per every 2 inches above the base length of 12"
function calcLengthAdder(length: number): number {
  const extraInches = Math.max(0, length - BASE_LENGTH);
  return (extraInches / 2) * 15;
}

// ─── Density Surcharge ────────────────────────────────────────────────────────
const DENSITY_ADDERS: Record<number, number> = {
  130: 0,
  150: 0,
  180: 40,
  200: 70,
  250: 110,
};

function calcDensityAdder(density: number): number {
  return DENSITY_ADDERS[density] ?? 0;
}

// ─── Lace Surcharge ───────────────────────────────────────────────────────────
const LACE_ADDERS: Record<string, number> = {
  "Transparent Lace": 0,
  "HD Lace":          55,
  "Silk Base":        95,
};

function calcLaceAdder(laceType: string): number {
  return LACE_ADDERS[laceType] ?? 0;
}

// ─── Artistry Surcharge ───────────────────────────────────────────────────────
function calcArtistryAdder(config: WigConfiguration): number {
  let total = 0;

  // Knots
  if (config.knotBleaching === "Bleached Knots")  total += 15;
  if (config.knotBleaching === "Pre-Bleached HD")  total += 25;

  // Hairline
  if (config.hairlineStyle === "Pre-Plucked")       total += 15;
  if (config.hairlineStyle === "Extra Pre-Plucked") total += 25;

  // Baby Hairs
  if (config.babyHairs === "Defined Edges")         total += 12;

  // Scent
  if (config.scent !== "None")                      total += 10;

  return total;
}

// ─── Tech Surcharge ───────────────────────────────────────────────────────────
function calcTechAdder(config: WigConfiguration): number {
  let total = 0;
  if (config.scalpMapping === "3D Scalp Mapping") total += 25;
  return total;
}

// ─── Packaging Surcharge ──────────────────────────────────────────────────────
function calcPackagingAdder(config: WigConfiguration): number {
  if (config.packaging === "Luxury Gift Box") return 20;
  return 0;
}

// ─── Hair Origin Surcharge ────────────────────────────────────────────────────
function calcOriginAdder(config: WigConfiguration): number {
  const adders: Record<string, number> = {
    "Virgin":          0,
    "Raw Indian":      30,
    "Raw Cambodian":   45,
    "Raw Vietnamese":  45,
  };
  return adders[config.origin] ?? 0;
}

// ─── Main Price Calculator ────────────────────────────────────────────────────
export function calculatePrice(
  config: WigConfiguration,
  shippingZone?: ShippingZone
): PriceBreakdown {
  const length    = calcLengthAdder(config.length);
  const density   = calcDensityAdder(config.density);
  const lace      = calcLaceAdder(config.laceType);
  const artistry  = calcArtistryAdder(config) + calcOriginAdder(config);
  const tech      = calcTechAdder(config);
  const packaging = calcPackagingAdder(config);

  const subtotal  = BASE_PRICE + length + density + lace + artistry + tech + packaging;

  const rate    = shippingZone ? SHIPPING_RATES.find(r => r.zone === shippingZone) : null;
  const shipping = rate ? rate.usd : 0;

  const total    = subtotal + shipping;
  const totalKES = Math.round(total * USD_TO_KES);

  return { base: BASE_PRICE, length, density, lace, artistry, tech, packaging, subtotal, shipping, total, totalKES };
}

// ─── Format USD ───────────────────────────────────────────────────────────────
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Format KES ───────────────────────────────────────────────────────────────
export function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style:    "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
