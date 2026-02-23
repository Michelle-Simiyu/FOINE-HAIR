import { describe, it, expect } from "vitest";
import {
  calculatePrice,
  formatUSD,
  formatKES,
  BASE_PRICE,
  USD_TO_KES,
} from "./priceCalculator";
import type { WigConfiguration } from "@/types/wig";

// ─── Base config (zero adders beyond BASE_PRICE) ──────────────────────────────
const BASE_CONFIG: WigConfiguration = {
  capSize:       "Average",
  laceType:      "Transparent Lace",
  laceTint:      "Caramel",
  security:      "Combs + Straps",
  length:        12,
  texture:       "Body Wave",
  density:       150,
  origin:        "Virgin",
  color:         "Natural Black",
  knotBleaching: "None",
  hairlineStyle: "Natural Sparse",
  babyHairs:     "None",
  scent:         "None",
  scalpMapping:  "None",
  packaging:     "Standard",
  paymentMethod: "pending",
};

// ─── calculatePrice ───────────────────────────────────────────────────────────
describe("calculatePrice", () => {
  it("returns BASE_PRICE with all-zero adders", () => {
    const bd = calculatePrice(BASE_CONFIG);
    expect(bd.base).toBe(BASE_PRICE);
    expect(bd.length).toBe(0);
    expect(bd.density).toBe(0);
    expect(bd.lace).toBe(0);
    expect(bd.artistry).toBe(0);
    expect(bd.tech).toBe(0);
    expect(bd.packaging).toBe(0);
    expect(bd.subtotal).toBe(BASE_PRICE);
    expect(bd.shipping).toBe(0);
    expect(bd.total).toBe(BASE_PRICE);
    expect(bd.totalKES).toBe(Math.round(BASE_PRICE * USD_TO_KES));
  });

  it("adds $15 per 2 inches above 12\"", () => {
    // 14" → +1 step → $15
    expect(calculatePrice({ ...BASE_CONFIG, length: 14 }).length).toBe(15);
    // 16" → +2 steps → $30
    expect(calculatePrice({ ...BASE_CONFIG, length: 16 }).length).toBe(30);
    // 24" → +6 steps → $90
    expect(calculatePrice({ ...BASE_CONFIG, length: 24 }).length).toBe(90);
  });

  it("adds $0 for 12\" length (base)", () => {
    expect(calculatePrice({ ...BASE_CONFIG, length: 12 }).length).toBe(0);
  });

  it("applies density adders correctly", () => {
    expect(calculatePrice({ ...BASE_CONFIG, density: 130 }).density).toBe(0);
    expect(calculatePrice({ ...BASE_CONFIG, density: 150 }).density).toBe(0);
    expect(calculatePrice({ ...BASE_CONFIG, density: 180 }).density).toBe(40);
    expect(calculatePrice({ ...BASE_CONFIG, density: 200 }).density).toBe(70);
    expect(calculatePrice({ ...BASE_CONFIG, density: 250 }).density).toBe(110);
  });

  it("applies lace adders correctly", () => {
    expect(calculatePrice({ ...BASE_CONFIG, laceType: "Transparent Lace" }).lace).toBe(0);
    expect(calculatePrice({ ...BASE_CONFIG, laceType: "HD Lace"          }).lace).toBe(55);
    expect(calculatePrice({ ...BASE_CONFIG, laceType: "Silk Base"        }).lace).toBe(95);
  });

  it("charges $15 for Bleached Knots and $25 for Pre-Bleached HD", () => {
    expect(calculatePrice({ ...BASE_CONFIG, knotBleaching: "Bleached Knots" }).artistry).toBe(15);
    expect(calculatePrice({ ...BASE_CONFIG, knotBleaching: "Pre-Bleached HD" }).artistry).toBe(25);
  });

  it("charges for hairline upgrades", () => {
    expect(calculatePrice({ ...BASE_CONFIG, hairlineStyle: "Pre-Plucked"       }).artistry).toBe(15);
    expect(calculatePrice({ ...BASE_CONFIG, hairlineStyle: "Extra Pre-Plucked" }).artistry).toBe(25);
  });

  it("charges $12 for Defined Edges baby hairs", () => {
    expect(calculatePrice({ ...BASE_CONFIG, babyHairs: "Defined Edges" }).artistry).toBe(12);
  });

  it("charges $10 for any non-None scent", () => {
    expect(calculatePrice({ ...BASE_CONFIG, scent: "Rose Oud"       }).artistry).toBe(10);
    expect(calculatePrice({ ...BASE_CONFIG, scent: "Vanilla Musk"   }).artistry).toBe(10);
    expect(calculatePrice({ ...BASE_CONFIG, scent: "None"           }).artistry).toBe(0);
  });

  it("applies hair origin adders", () => {
    expect(calculatePrice({ ...BASE_CONFIG, origin: "Virgin"        }).artistry).toBe(0);
    expect(calculatePrice({ ...BASE_CONFIG, origin: "Raw Indian"    }).artistry).toBe(30);
    expect(calculatePrice({ ...BASE_CONFIG, origin: "Raw Cambodian" }).artistry).toBe(45);
    expect(calculatePrice({ ...BASE_CONFIG, origin: "Raw Vietnamese"}).artistry).toBe(45);
  });

  it("charges $25 for 3D Scalp Mapping", () => {
    expect(calculatePrice({ ...BASE_CONFIG, scalpMapping: "3D Scalp Mapping" }).tech).toBe(25);
    expect(calculatePrice({ ...BASE_CONFIG, scalpMapping: "None"              }).tech).toBe(0);
  });

  it("charges $20 for Luxury Gift Box packaging", () => {
    expect(calculatePrice({ ...BASE_CONFIG, packaging: "Luxury Gift Box" }).packaging).toBe(20);
    expect(calculatePrice({ ...BASE_CONFIG, packaging: "Standard"        }).packaging).toBe(0);
  });

  it("adds shipping when a zone is provided", () => {
    const bd = calculatePrice(BASE_CONFIG, "Nairobi Central");
    expect(bd.shipping).toBe(2);
    expect(bd.total).toBe(BASE_PRICE + 2);
  });

  it("adds no shipping when no zone is provided", () => {
    expect(calculatePrice(BASE_CONFIG).shipping).toBe(0);
  });

  it("computes totalKES as total × USD_TO_KES rounded", () => {
    const bd = calculatePrice(BASE_CONFIG, "International");
    expect(bd.totalKES).toBe(Math.round(bd.total * USD_TO_KES));
  });

  it("fully-loaded wig sums all adders correctly", () => {
    const config: WigConfiguration = {
      ...BASE_CONFIG,
      length:        24,   // +90
      density:       200,  // +70
      laceType:      "Silk Base",      // +95
      origin:        "Raw Cambodian",  // +45
      knotBleaching: "Pre-Bleached HD",// +25
      hairlineStyle: "Extra Pre-Plucked",// +25
      babyHairs:     "Defined Edges",  // +12
      scent:         "Rose Oud",       // +10
      scalpMapping:  "3D Scalp Mapping",// +25
      packaging:     "Luxury Gift Box",// +20
    };
    const bd = calculatePrice(config);
    // artistry = 25 (knots) + 25 (hairline) + 12 (baby) + 10 (scent) + 45 (origin) = 117
    expect(bd.artistry).toBe(117);
    const expectedSubtotal = 150 + 90 + 70 + 95 + 117 + 25 + 20;
    expect(bd.subtotal).toBe(expectedSubtotal);
  });
});

// ─── formatUSD ────────────────────────────────────────────────────────────────
describe("formatUSD", () => {
  it("formats whole dollar amounts without decimals", () => {
    expect(formatUSD(150)).toBe("$150");
    expect(formatUSD(0)).toBe("$0");
    expect(formatUSD(1000)).toBe("$1,000");
  });
});

// ─── formatKES ────────────────────────────────────────────────────────────────
describe("formatKES", () => {
  it("formats KES amounts", () => {
    const result = formatKES(20250);
    expect(result).toContain("20");    // 20,250 or KES 20,250
    expect(result.toLowerCase()).toMatch(/kes|ksh/i);
  });
});
