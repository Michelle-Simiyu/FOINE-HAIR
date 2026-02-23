import type { WigConfiguration, HairDensity, ValidationResult } from "@/types/wig";

// ─── Density/Length Rules ─────────────────────────────────────────────────────
//  10"–14" → min 130%
//  16"–22" → min 150%
//  24"–32" → min 180%

export function getMinDensityForLength(length: number): HairDensity {
  if (length >= 24) return 180;
  if (length >= 16) return 150;
  return 130;
}

// ─── Validate & Return Auto-Fixes ─────────────────────────────────────────────
export function validateConfiguration(config: WigConfiguration): ValidationResult {
  const warnings:  string[] = [];
  const autoFixes: ValidationResult["autoFixes"] = [];

  // 1. Density/Length dependency
  const minDensity = getMinDensityForLength(config.length);
  if (config.density < minDensity) {
    autoFixes.push({
      field:   "density",
      value:   minDensity,
      message: `${config.length}" length requires at least ${minDensity}% density — automatically upgraded for structural integrity.`,
    });
  }

  // 2. Silk Base forces Piano Straps
  if (config.laceType === "Silk Base" && config.security !== "Adjustable Elastic Piano Straps") {
    autoFixes.push({
      field:   "security",
      value:   "Adjustable Elastic Piano Straps",
      message: "Silk Base construction requires Adjustable Elastic Piano Straps for proper security.",
    });
  }

  return {
    isValid:   autoFixes.length === 0,
    warnings,
    autoFixes,
  };
}

// ─── Apply Auto-Fixes ─────────────────────────────────────────────────────────
export function applyAutoFixes(
  config: WigConfiguration,
  fixes: ValidationResult["autoFixes"]
): WigConfiguration {
  let updated = { ...config };
  for (const fix of fixes) {
    updated = { ...updated, [fix.field]: fix.value };
  }
  return updated;
}

// ─── Is Step Complete ─────────────────────────────────────────────────────────
export function isFoundationComplete(config: WigConfiguration): boolean {
  return !!(config.capSize && config.laceType && config.laceTint);
}

export function isDnaComplete(config: WigConfiguration): boolean {
  return !!(config.length && config.texture && config.density && config.origin && config.color);
}

export function isArtistryComplete(config: WigConfiguration): boolean {
  return !!(config.knotBleaching && config.hairlineStyle && config.babyHairs && config.scent);
}

export function isFinishComplete(config: WigConfiguration): boolean {
  return !!(config.scalpMapping && config.packaging);
}
