import type { ShippingRate, ShippingZone } from "@/types/wig";

// ─── Shipping Rates ───────────────────────────────────────────────────────────
export const SHIPPING_RATES: ShippingRate[] = [
  {
    zone:  "Nairobi Central",
    usd:   2.00,
    kes:   300,
    label: "Nairobi CBD / Upperhill",
    days:  "Same day / Next day",
  },
  {
    zone:  "Kilimani",
    usd:   2.00,
    kes:   300,
    label: "Kilimani / Hurlingham",
    days:  "Same day / Next day",
  },
  {
    zone:  "Westlands",
    usd:   2.00,
    kes:   300,
    label: "Westlands / Parklands",
    days:  "Same day / Next day",
  },
  {
    zone:  "Lavington",
    usd:   2.00,
    kes:   300,
    label: "Lavington / Kileleshwa",
    days:  "Same day / Next day",
  },
  {
    zone:  "Karen",
    usd:   4.00,
    kes:   600,
    label: "Karen / Langata / Ngong",
    days:  "1–2 business days",
  },
  {
    zone:  "Nairobi Outskirts (Rongai/Ruiru)",
    usd:   4.00,
    kes:   600,
    label: "Rongai / Ruiru / Thika / Kiambu",
    days:  "1–2 business days",
  },
  {
    zone:  "Upcountry (G4S/Wells Fargo)",
    usd:   6.00,
    kes:   850,
    label: "Eldoret / Kisumu / Mombasa & beyond",
    days:  "3–5 business days",
  },
  {
    zone:  "International",
    usd:   25.00,
    kes:   3375,
    label: "International Delivery (DHL)",
    days:  "7–14 business days",
  },
];

// ─── Supported zone names (for zod validation) ────────────────────────────────
export const SUPPORTED_ZONES = SHIPPING_RATES.map(r => r.zone) as ShippingZone[];

// ─── Lookup helpers ───────────────────────────────────────────────────────────
export function getShippingRate(zone: ShippingZone): ShippingRate | undefined {
  return SHIPPING_RATES.find(r => r.zone === zone);
}

export function getShippingCostUSD(zone: ShippingZone): number {
  return getShippingRate(zone)?.usd ?? 0;
}

export function getShippingCostKES(zone: ShippingZone): number {
  return getShippingRate(zone)?.kes ?? 0;
}

export function isZoneSupported(zone: string): zone is ShippingZone {
  return SUPPORTED_ZONES.includes(zone as ShippingZone);
}

// ─── Delivery estimate ─────────────────────────────────────────────────────────
// Returns a Date for the expected delivery (production days + shipping days, skipping weekends)
export function estimateDelivery(zone: ShippingZone, productionDays = 3): Date {
  const rate = getShippingRate(zone);
  if (!rate) throw new Error(`Unknown shipping zone: ${zone}`);

  const match    = rate.days.match(/\d+/g);
  const shipDays = match ? Math.max(...match.map(Number)) : 5;
  const total    = productionDays + shipDays;

  const date = new Date();
  let added  = 0;
  while (added < total) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  return date;
}

// ─── Zone category helpers ─────────────────────────────────────────────────────
export function isNairobiCentral(zone: ShippingZone): boolean {
  return ["Nairobi Central", "Kilimani", "Westlands", "Lavington"].includes(zone);
}

export function isOutskirts(zone: ShippingZone): boolean {
  return ["Karen", "Nairobi Outskirts (Rongai/Ruiru)"].includes(zone);
}

export function isUpcountry(zone: ShippingZone): boolean {
  return zone === "Upcountry (G4S/Wells Fargo)";
}

export function isInternational(zone: ShippingZone): boolean {
  return zone === "International";
}

// ─── Unsupported zone message ──────────────────────────────────────────────────
export function getUnsupportedZoneMessage(zone: string): string {
  return `Delivery to "${zone}" is not yet available. Contact hello@foinehair.co.ke for a custom quote.`;
}

// ─── Kenyan phone number helpers ───────────────────────────────────────────────
// Accepts: 0712345678 / +254712345678 / 254712345678
export const KENYAN_PHONE_REGEX = /^(?:\+?254|0)[17]\d{8}$/;

export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0"))   return "+254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return "+"    + cleaned;
  return cleaned;
}

export function isValidKenyanPhone(phone: string): boolean {
  return KENYAN_PHONE_REGEX.test(phone.replace(/[\s\-()]/g, ""));
}
