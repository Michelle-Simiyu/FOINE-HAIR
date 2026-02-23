// ─── Enum-style literal unions ───────────────────────────────────────────────

export type CapSize      = "Petite" | "Average" | "Large";
export type LaceType     = "Transparent Lace" | "HD Lace" | "Silk Base";
export type LaceTint     = "Porcelain" | "Honey" | "Caramel" | "Espresso" | "Ebony";
export type HairLength   = 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32;
export type HairTexture  = "Straight" | "Body Wave" | "Loose Wave" | "Deep Wave" | "Kinky Straight" | "4C Coily";
export type HairDensity  = 130 | 150 | 180 | 200 | 250;
export type HairOrigin   = "Virgin" | "Raw Indian" | "Raw Cambodian" | "Raw Vietnamese";
export type HairColor    =
  | "Natural Black"
  | "Off Black (1B)"
  | "Dark Brown"
  | "Medium Brown"
  | "Honey Blonde"
  | "Platinum Blonde"
  | "Burgundy"
  | "Ombre (1B/27)"
  | "Ombre (1B/Burgundy)"
  | "Custom Color";

export type KnotBleaching  = "None" | "Bleached Knots" | "Pre-Bleached HD";
export type HairlineStyle  = "Natural Sparse" | "Pre-Plucked" | "Extra Pre-Plucked";
export type BabyHairStyle  = "None" | "Minimal" | "Defined Edges";
export type ScentOption    = "None" | "Rose Oud" | "Vanilla Musk" | "Unscented Premium";

export type SecurityOption = "Adjustable Elastic Piano Straps" | "Combs Only" | "Combs + Straps";

export type ScalpMapping   = "None" | "3D Scalp Mapping";
export type PackagingType  = "Standard" | "Luxury Gift Box";

export type PaymentMethod  = "mpesa" | "stripe" | "pending";
export type OrderStatus    = "pending" | "paid" | "in_production" | "shipped" | "delivered";

// ─── Core Configuration (the "Wig Recipe") ───────────────────────────────────

export interface WigConfiguration {
  // Foundation
  capSize:     CapSize;
  laceType:    LaceType;
  laceTint:    LaceTint;
  security:    SecurityOption;

  // DNA
  length:      HairLength;
  texture:     HairTexture;
  density:     HairDensity;
  origin:      HairOrigin;
  color:       HairColor;

  // Artistry
  knotBleaching:  KnotBleaching;
  hairlineStyle:  HairlineStyle;
  babyHairs:      BabyHairStyle;
  scent:          ScentOption;

  // Finish
  scalpMapping:   ScalpMapping;
  packaging:      PackagingType;
  paymentMethod:  PaymentMethod;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface PriceBreakdown {
  base:           number;
  length:         number;
  density:        number;
  lace:           number;
  artistry:       number;
  tech:           number;
  packaging:      number;
  subtotal:       number;
  shipping:       number;
  total:          number;
  totalKES:       number;
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export type ShippingZone =
  | "Nairobi Central"
  | "Kilimani"
  | "Westlands"
  | "Lavington"
  | "Karen"
  | "Nairobi Outskirts (Rongai/Ruiru)"
  | "Upcountry (G4S/Wells Fargo)"
  | "International";

export interface ShippingRate {
  zone:       ShippingZone;
  usd:        number;
  kes:        number;
  label:      string;
  days:       string;
}

// ─── Customer Details ─────────────────────────────────────────────────────────

export interface CustomerDetails {
  name:          string;
  phone:         string;
  email:         string;
  deliveryZone:  ShippingZone;
  address:       string;
  notes:         string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface Order {
  id:                string;
  createdAt:         string;
  configurationJSON: WigConfiguration;
  customerDetails:   CustomerDetails;
  priceBreakdown:    PriceBreakdown;
  paymentStatus:     "pending" | "paid" | "failed";
  orderStatus:       OrderStatus;
  shippingZone:      ShippingZone;
  mpesaReceiptNo?:   string;
  wigName?:          string;
  // Extended fields (mirrors Prisma schema upgrades)
  adminNotes?:       string;
  statusHistory?:    unknown[];
  deliveryEstimate?: string;
  internalRef?:      string;
  paidAt?:           string;
}

// ─── Gallery Model ────────────────────────────────────────────────────────────

export interface InspirationModel {
  id:            string;
  name:          string;
  tagline:       string;
  image:         string;
  preset:        Partial<WigConfiguration>;
  priceFrom:     number;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid:    boolean;
  warnings:   string[];
  autoFixes:  Array<{ field: keyof WigConfiguration; value: unknown; message: string }>;
}

// ─── Configurator Step ───────────────────────────────────────────────────────

export type ConfigStep = "foundation" | "dna" | "artistry" | "finish";

export interface ConfigStepMeta {
  id:       ConfigStep;
  label:    string;
  icon:     string;
  fields:   Array<keyof WigConfiguration>;
}
