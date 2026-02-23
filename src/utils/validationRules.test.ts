import { describe, it, expect } from "vitest";
import {
  getMinDensityForLength,
  validateConfiguration,
  applyAutoFixes,
  isFoundationComplete,
  isDnaComplete,
  isArtistryComplete,
  isFinishComplete,
} from "./validationRules";
import type { WigConfiguration } from "@/types/wig";

// ─── Base config (fully valid) ────────────────────────────────────────────────
const VALID_CONFIG: WigConfiguration = {
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

// ─── getMinDensityForLength ───────────────────────────────────────────────────
describe("getMinDensityForLength", () => {
  it("returns 130 for 10\" and 12\"", () => {
    expect(getMinDensityForLength(10)).toBe(130);
    expect(getMinDensityForLength(12)).toBe(130);
    expect(getMinDensityForLength(14)).toBe(130);
  });

  it("returns 150 for 16\"–22\"", () => {
    expect(getMinDensityForLength(16)).toBe(150);
    expect(getMinDensityForLength(18)).toBe(150);
    expect(getMinDensityForLength(20)).toBe(150);
    expect(getMinDensityForLength(22)).toBe(150);
  });

  it("returns 180 for 24\" and above", () => {
    expect(getMinDensityForLength(24)).toBe(180);
    expect(getMinDensityForLength(28)).toBe(180);
    expect(getMinDensityForLength(32)).toBe(180);
  });
});

// ─── validateConfiguration ────────────────────────────────────────────────────
describe("validateConfiguration", () => {
  it("returns isValid=true for a fully-valid config", () => {
    const result = validateConfiguration(VALID_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.autoFixes).toHaveLength(0);
  });

  it("auto-fixes density when too low for length (10\"–14\" → min 130)", () => {
    const config = { ...VALID_CONFIG, length: 14 as const, density: 130 as const };
    const result = validateConfiguration(config);
    // density 130 meets min 130 for 14" → valid
    expect(result.isValid).toBe(true);
  });

  it("auto-fixes density when 130 selected with 16\" length", () => {
    const config = { ...VALID_CONFIG, length: 16 as const, density: 130 as const };
    const result = validateConfiguration(config);
    expect(result.isValid).toBe(false);
    const densityFix = result.autoFixes.find(f => f.field === "density");
    expect(densityFix).toBeDefined();
    expect(densityFix?.value).toBe(150);
  });

  it("auto-fixes density when 150 selected with 24\" length", () => {
    const config = { ...VALID_CONFIG, length: 24 as const, density: 150 as const };
    const result = validateConfiguration(config);
    expect(result.isValid).toBe(false);
    const densityFix = result.autoFixes.find(f => f.field === "density");
    expect(densityFix?.value).toBe(180);
  });

  it("auto-fixes security when Silk Base + non-Piano-Straps selected", () => {
    const config = { ...VALID_CONFIG, laceType: "Silk Base" as const, security: "Combs Only" as const };
    const result = validateConfiguration(config);
    expect(result.isValid).toBe(false);
    const fix = result.autoFixes.find(f => f.field === "security");
    expect(fix).toBeDefined();
    expect(fix?.value).toBe("Adjustable Elastic Piano Straps");
  });

  it("does NOT flag security when Silk Base + Piano Straps", () => {
    const config = {
      ...VALID_CONFIG,
      laceType: "Silk Base" as const,
      security: "Adjustable Elastic Piano Straps" as const,
    };
    const result = validateConfiguration(config);
    const securityFix = result.autoFixes.find(f => f.field === "security");
    expect(securityFix).toBeUndefined();
  });

  it("can produce multiple auto-fixes at once", () => {
    const config = {
      ...VALID_CONFIG,
      length:   24 as const,
      density:  130 as const,  // too low for 24"
      laceType: "Silk Base" as const,
      security: "Combs Only" as const, // wrong for Silk Base
    };
    const result = validateConfiguration(config);
    expect(result.autoFixes.length).toBeGreaterThanOrEqual(2);
    expect(result.isValid).toBe(false);
  });

  it("includes a human-readable message in each fix", () => {
    const config = { ...VALID_CONFIG, length: 16 as const, density: 130 as const };
    const result = validateConfiguration(config);
    expect(result.autoFixes[0].message.length).toBeGreaterThan(10);
  });
});

// ─── applyAutoFixes ───────────────────────────────────────────────────────────
describe("applyAutoFixes", () => {
  it("applies fixes and returns a new config object", () => {
    const config = { ...VALID_CONFIG, length: 24 as const, density: 130 as const };
    const result = validateConfiguration(config);
    const fixed  = applyAutoFixes(config, result.autoFixes);
    expect(fixed.density).toBe(180);
    // original must not be mutated
    expect(config.density).toBe(130);
  });

  it("returns an unchanged config when fixes is empty", () => {
    const fixed = applyAutoFixes(VALID_CONFIG, []);
    expect(fixed).toEqual(VALID_CONFIG);
  });

  it("applies multiple fixes in order", () => {
    const config = {
      ...VALID_CONFIG,
      length:   24 as const,
      density:  130 as const,
      laceType: "Silk Base" as const,
      security: "Combs Only" as const,
    };
    const { autoFixes } = validateConfiguration(config);
    const fixed = applyAutoFixes(config, autoFixes);
    expect(fixed.density).toBe(180);
    expect(fixed.security).toBe("Adjustable Elastic Piano Straps");
  });
});

// ─── Step completeness helpers ────────────────────────────────────────────────
describe("isFoundationComplete", () => {
  it("returns true when capSize, laceType, laceTint are set", () => {
    expect(isFoundationComplete(VALID_CONFIG)).toBe(true);
  });
});

describe("isDnaComplete", () => {
  it("returns true when all DNA fields are set", () => {
    expect(isDnaComplete(VALID_CONFIG)).toBe(true);
  });
});

describe("isArtistryComplete", () => {
  it("returns true when all artistry fields are set", () => {
    expect(isArtistryComplete(VALID_CONFIG)).toBe(true);
  });
});

describe("isFinishComplete", () => {
  it("returns true when scalpMapping and packaging are set", () => {
    expect(isFinishComplete(VALID_CONFIG)).toBe(true);
  });
});
