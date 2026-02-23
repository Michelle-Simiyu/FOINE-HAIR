import { describe, it, expect } from "vitest";
import {
  SHIPPING_RATES,
  SUPPORTED_ZONES,
  getShippingRate,
  getShippingCostUSD,
  getShippingCostKES,
  isZoneSupported,
  isNairobiCentral,
  isOutskirts,
  isUpcountry,
  isInternational,
  estimateDelivery,
  isValidKenyanPhone,
  normalizeKenyanPhone,
  KENYAN_PHONE_REGEX,
} from "./shippingRules";
import type { ShippingZone } from "@/types/wig";

// ─── SHIPPING_RATES coverage ──────────────────────────────────────────────────
describe("SHIPPING_RATES", () => {
  it("contains 8 zones", () => {
    expect(SHIPPING_RATES).toHaveLength(8);
  });

  it("every rate has usd, kes, zone, label, days", () => {
    for (const rate of SHIPPING_RATES) {
      expect(rate.usd).toBeGreaterThan(0);
      expect(rate.kes).toBeGreaterThan(0);
      expect(rate.zone).toBeTruthy();
      expect(rate.label).toBeTruthy();
      expect(rate.days).toBeTruthy();
    }
  });

  it("Nairobi Central costs $2 / KES 300", () => {
    const rate = getShippingRate("Nairobi Central");
    expect(rate?.usd).toBe(2);
    expect(rate?.kes).toBe(300);
  });

  it("International costs $25 / KES 3375", () => {
    const rate = getShippingRate("International");
    expect(rate?.usd).toBe(25);
    expect(rate?.kes).toBe(3375);
  });
});

// ─── SUPPORTED_ZONES ─────────────────────────────────────────────────────────
describe("SUPPORTED_ZONES", () => {
  it("matches the zones from SHIPPING_RATES", () => {
    const rateZones = SHIPPING_RATES.map(r => r.zone);
    expect(SUPPORTED_ZONES).toEqual(rateZones);
  });
});

// ─── getShippingCostUSD / getShippingCostKES ──────────────────────────────────
describe("getShippingCostUSD", () => {
  it("returns USD cost for known zones", () => {
    expect(getShippingCostUSD("Karen")).toBe(4);
    expect(getShippingCostUSD("Upcountry (G4S/Wells Fargo)")).toBe(6);
  });

  it("returns 0 for unknown zone", () => {
    expect(getShippingCostUSD("Mars" as ShippingZone)).toBe(0);
  });
});

describe("getShippingCostKES", () => {
  it("returns KES cost for known zones", () => {
    expect(getShippingCostKES("Karen")).toBe(600);
    expect(getShippingCostKES("International")).toBe(3375);
  });
});

// ─── isZoneSupported ─────────────────────────────────────────────────────────
describe("isZoneSupported", () => {
  it("returns true for all supported zones", () => {
    for (const zone of SUPPORTED_ZONES) {
      expect(isZoneSupported(zone)).toBe(true);
    }
  });

  it("returns false for unsupported zones", () => {
    expect(isZoneSupported("Mombasa")).toBe(false);
    expect(isZoneSupported("")).toBe(false);
  });
});

// ─── Zone category helpers ────────────────────────────────────────────────────
describe("isNairobiCentral", () => {
  it("returns true for central zones", () => {
    expect(isNairobiCentral("Nairobi Central")).toBe(true);
    expect(isNairobiCentral("Kilimani")).toBe(true);
    expect(isNairobiCentral("Westlands")).toBe(true);
    expect(isNairobiCentral("Lavington")).toBe(true);
  });

  it("returns false for non-central zones", () => {
    expect(isNairobiCentral("Karen")).toBe(false);
    expect(isNairobiCentral("International")).toBe(false);
  });
});

describe("isOutskirts", () => {
  it("identifies outskirts zones", () => {
    expect(isOutskirts("Karen")).toBe(true);
    expect(isOutskirts("Nairobi Outskirts (Rongai/Ruiru)")).toBe(true);
    expect(isOutskirts("Nairobi Central")).toBe(false);
  });
});

describe("isUpcountry", () => {
  it("identifies upcountry zone", () => {
    expect(isUpcountry("Upcountry (G4S/Wells Fargo)")).toBe(true);
    expect(isUpcountry("Karen")).toBe(false);
  });
});

describe("isInternational", () => {
  it("identifies international zone", () => {
    expect(isInternational("International")).toBe(true);
    expect(isInternational("Nairobi Central")).toBe(false);
  });
});

// ─── estimateDelivery ────────────────────────────────────────────────────────
describe("estimateDelivery", () => {
  it("returns a Date in the future", () => {
    const estimate = estimateDelivery("Nairobi Central");
    expect(estimate).toBeInstanceOf(Date);
    expect(estimate.getTime()).toBeGreaterThan(Date.now());
  });

  it("international delivery is further out than local", () => {
    const local  = estimateDelivery("Nairobi Central");
    const intl   = estimateDelivery("International");
    expect(intl.getTime()).toBeGreaterThan(local.getTime());
  });

  it("throws for unknown zones", () => {
    expect(() => estimateDelivery("Atlantis" as ShippingZone)).toThrow();
  });

  it("respects custom productionDays", () => {
    const fast = estimateDelivery("Karen", 1);
    const slow = estimateDelivery("Karen", 7);
    expect(slow.getTime()).toBeGreaterThan(fast.getTime());
  });
});

// ─── KENYAN_PHONE_REGEX ───────────────────────────────────────────────────────
describe("KENYAN_PHONE_REGEX", () => {
  const valid = [
    "0712345678",
    "0712345679",
    "0722345678",
    "+254712345678",
    "254712345678",
    "0112345678",   // Airtel Kenya
  ];
  const invalid = [
    "0512345678",   // invalid prefix 05
    "712345678",    // missing leading 0 or country code
    "07123456",     // too short
    "+1-800-555-0199",
    "",
    "abc",
  ];

  it("accepts valid Kenyan numbers", () => {
    for (const n of valid) {
      expect(KENYAN_PHONE_REGEX.test(n), `Expected valid: ${n}`).toBe(true);
    }
  });

  it("rejects invalid numbers", () => {
    for (const n of invalid) {
      expect(KENYAN_PHONE_REGEX.test(n), `Expected invalid: ${n}`).toBe(false);
    }
  });
});

// ─── isValidKenyanPhone ───────────────────────────────────────────────────────
describe("isValidKenyanPhone", () => {
  it("strips whitespace and dashes before validating", () => {
    expect(isValidKenyanPhone("0712 345 678")).toBe(true);
    expect(isValidKenyanPhone("0712-345-678")).toBe(true);
    expect(isValidKenyanPhone("+254 712 345 678")).toBe(true);
  });

  it("returns false for clearly invalid numbers", () => {
    expect(isValidKenyanPhone("hello")).toBe(false);
    expect(isValidKenyanPhone("0512345678")).toBe(false);
  });
});

// ─── normalizeKenyanPhone ────────────────────────────────────────────────────
describe("normalizeKenyanPhone", () => {
  it("converts 07xx to +254xx", () => {
    expect(normalizeKenyanPhone("0712345678")).toBe("+254712345678");
  });

  it("converts 2547xx to +2547xx", () => {
    expect(normalizeKenyanPhone("254712345678")).toBe("+254712345678");
  });

  it("leaves +254xx unchanged", () => {
    expect(normalizeKenyanPhone("+254712345678")).toBe("+254712345678");
  });

  it("strips spaces and dashes before normalizing", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("+254712345678");
    expect(normalizeKenyanPhone("0712-345-678")).toBe("+254712345678");
  });
});
