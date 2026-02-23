import type { WigConfiguration } from "@/types/wig";

// ─── Cloudinary Config ─────────────────────────────────────────────────────────
const CLOUD_NAME  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo";
const BASE_URL    = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// ─── Layer Mapping ────────────────────────────────────────────────────────────
const TEXTURE_LAYER: Record<string, string> = {
  "Straight":       "foine/textures/straight",
  "Body Wave":      "foine/textures/body-wave",
  "Loose Wave":     "foine/textures/loose-wave",
  "Deep Wave":      "foine/textures/deep-wave",
  "Kinky Straight": "foine/textures/kinky-straight",
  "4C Coily":       "foine/textures/4c-coily",
};

const COLOR_HEX: Record<string, string> = {
  "Natural Black":        "0a0a0a",
  "Off Black (1B)":       "1a1a1a",
  "Dark Brown":           "3d2314",
  "Medium Brown":         "6b3a1f",
  "Honey Blonde":         "c8922a",
  "Platinum Blonde":      "f0e6c8",
  "Burgundy":             "6b1a2a",
  "Ombre (1B/27)":        "8b6914",
  "Ombre (1B/Burgundy)":  "5c1520",
  "Custom Color":         "a08060",
};

const TINT_OVERLAY: Record<string, string> = {
  "Porcelain": "ffdbc9",
  "Honey":     "f5c5a3",
  "Caramel":   "c68642",
  "Espresso":  "7d4b2a",
  "Ebony":     "3b1f0e",
};

// ─── Build Cloudinary Transformation URL ─────────────────────────────────────
export function buildWigImageUrl(config: WigConfiguration): string {
  const textureId = TEXTURE_LAYER[config.texture] ?? "foine/textures/straight";
  const colorHex  = COLOR_HEX[config.color]      ?? "0a0a0a";
  const tintHex   = TINT_OVERLAY[config.laceTint] ?? "f5c5a3";

  // Build transformation chain
  const transforms = [
    // 1. Base cap layer — quality + size
    "q_auto,f_auto,w_800,h_900,c_fill",

    // 2. Texture overlay
    `l_${textureId.replace(/\//g, ":")},fl_layer_apply,w_800,h_900`,

    // 3. Color tint overlay (semi-transparent)
    `l_foine:overlays:color-wash,e_colorize:60,co_rgb:${colorHex},fl_layer_apply`,

    // 4. Lace tint overlay
    `l_foine:overlays:lace-tint,e_colorize:30,co_rgb:${tintHex},fl_layer_apply`,
  ].join("/");

  return `${BASE_URL}/${transforms}/foine/base/cap-dome`;
}

// ─── Fallback placeholder (no Cloudinary credentials) ─────────────────────────
export function buildPlaceholderUrl(config: WigConfiguration): string {
  const colorHex = COLOR_HEX[config.color] ?? "0a0a0a";
  // Uses a gradient placeholder via Cloudinary
  return `${BASE_URL}/w_800,h_900,c_fill,b_rgb:${colorHex},q_auto/foine/placeholder`;
}

// ─── Get image URL (with fallback) ────────────────────────────────────────────
export function getWigImageUrl(config: WigConfiguration): string {
  if (CLOUD_NAME === "demo") {
    // Return a high-quality SVG data URI placeholder when not configured
    return buildSvgPlaceholder(config);
  }
  return buildWigImageUrl(config);
}

// ─── SVG Placeholder for development ─────────────────────────────────────────
function buildSvgPlaceholder(config: WigConfiguration): string {
  const colorHex = COLOR_HEX[config.color] ?? "0a0a0a";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#${colorHex}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#111" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="800" height="900" fill="url(#bg)"/>
      <text x="400" y="420" text-anchor="middle" fill="#d4920e" font-size="28" font-family="Georgia">
        ${config.texture}
      </text>
      <text x="400" y="460" text-anchor="middle" fill="#888" font-size="16" font-family="Arial">
        ${config.length}" · ${config.density}% · ${config.laceType}
      </text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
