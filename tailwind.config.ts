import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fdf9ec",
          100: "#faf0ca",
          200: "#f4dd90",
          300: "#eec555",
          400: "#e9ae2e",
          500: "#d4920e",
          600: "#b87209",
          700: "#8f520b",
          800: "#764210",
          900: "#643712",
          950: "#3a1c05",
        },
        obsidian: "#0a0a0a",
        ivory:   "#f5f4ef",
      },
      fontFamily: {
        sans:  ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-geist-mono)", "monospace"],
        serif: ["Georgia", "serif"],
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease-in-out",
        "slide-up":    "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
        "price-tick":  "priceTick 0.25s cubic-bezier(0.16,1,0.3,1)",
        "shimmer":     "shimmer 1.5s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        priceTick: {
          "0%":   { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0"  },
        },
      },
      backgroundImage: {
        "gold-gradient":     "linear-gradient(135deg, #d4920e 0%, #e9ae2e 50%, #b87209 100%)",
        "shimmer-gradient":  "linear-gradient(90deg, transparent 0%, rgba(212,146,14,0.15) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
